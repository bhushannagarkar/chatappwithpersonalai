import React, { useState, useEffect, useContext, useRef } from "react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import Lottie from "react-lottie";
import animationdata from "../../typingAnimation.json";
import {
  Box,
  InputGroup,
  Input,
  Text,
  InputRightElement,
  Button,
  FormControl,
  InputLeftElement,
  useToast,
  useDisclosure,
  Flex,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
import { FaFileUpload } from "react-icons/fa";
import { marked } from "marked";
import chatContext from "../../context/chatContext";
import ChatAreaTop from "./ChatAreaTop";
import FileUploadModal from "../miscellaneous/FileUploadModal";
import ChatLoadingSpinner from "../miscellaneous/ChatLoadingSpinner";
import axios from "axios";
import SingleMessage from "./SingleMessage";

const scrollbarConfig = {
  "&::-webkit-scrollbar": {
    width: "6px",
    height: "6px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "gray.300",
    borderRadius: "6px",
    transition: "background-color 0.2s",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "gray.500",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "transparent",
  },
};

const markdownToHtml = (markdownText) => {
  try {
    const html = marked(markdownText || "");
    return { __html: html };
  } catch (error) {
    console.error("Error parsing markdown:", error);
    return { __html: markdownText || "" };
  }
};

export const ChatArea = () => {
  const context = useContext(chatContext);
  const {
    hostName,
    user,
    receiver,
    socket,
    activeChatId,
    messageList,
    setMessageList,
    isOtherUserTyping,
    setIsOtherUserTyping,
    setActiveChatId,
    setReceiver,
    setMyChatList,
    myChatList,
    isChatLoading,
  } = context;
  
  const [typing, setTyping] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const { colorMode } = useColorMode();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationdata,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    const handlePopState = () => {
      if (socket && activeChatId) {
        socket.emit("leave-chat", activeChatId);
        setActiveChatId("");
        setMessageList([]);
        setReceiver({});
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [socket, activeChatId, setActiveChatId, setMessageList, setReceiver]);

  useEffect(() => {
    if (!socket) return;

    socket.on("user-joined-room", (userId) => {
      setMessageList((prevMessageList) => {
        const updatedList = prevMessageList.map((message) => {
          if (message.senderId === user?._id && userId !== user?._id) {
            const index = message.seenBy?.findIndex((seen) => seen.user === userId);
            if (index === -1 && Array.isArray(message.seenBy)) {
              message.seenBy.push({ user: userId, seenAt: new Date() });
            }
          }
          return message;
        });
        return updatedList;
      });
    });

    socket.on("typing", (data) => {
      if (data.typer !== user?._id) setIsOtherUserTyping(true);
    });

    socket.on("stop-typing", (data) => {
      if (data.typer !== user?._id) setIsOtherUserTyping(false);
    });

    socket.on("receive-message", (data) => {
      setMessageList((prev) => [...prev, data]);
      scrollToBottom();
    });

    socket.on("message-deleted", (data) => {
      setMessageList((prev) => prev.filter((msg) => msg._id !== data.messageId));
    });

    return () => {
      socket.off("user-joined-room");
      socket.off("typing");
      socket.off("stop-typing");
      socket.off("receive-message");
      socket.off("message-deleted");
    };
  }, [socket, user, setMessageList, setIsOtherUserTyping]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleTyping = () => {
    if (!inputRef.current || !socket || !activeChatId) return;

    if (inputRef.current.value === "" && typing) {
      setTyping(false);
      socket.emit("stop-typing", {
        typer: user?._id,
        ConversationId: activeChatId,
      });
    } else if (inputRef.current.value !== "" && !typing) {
      setTyping(true);
      socket.emit("typing", {
        typer: user?._id,
        ConversationId: activeChatId,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage(e);
  };

  const getPreSignedUrl = async (fileName, fileType) => {
    if (!fileName || !fileType) return null;
    try {
      const response = await fetch(
        `${hostName}/user/presigned-url?filename=${encodeURIComponent(fileName)}&filetype=${encodeURIComponent(fileType)}`,
        {
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("token"),
          },
        }
      );
      if (!response.ok) throw new Error("Failed to get pre-signed URL");
      return await response.json();
    } catch (error) {
      toast({
        title: error.message || "Error getting upload URL",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return null;
    }
  };

  const handleSendMessage = async (e, messageText, file) => {
    e?.preventDefault();
    
    if (!socket || !activeChatId || !user?._id) {
      toast({
        title: "Connection error. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const awsHost = "https://Conversa-chat.s3.ap-south-1.amazonaws.com/";
    messageText = messageText || inputRef.current?.value || "";

    socket.emit("stop-typing", {
      typer: user._id,
      ConversationId: activeChatId,
    });
    setTyping(false);

    if (messageText.trim() === "" && !file) {
      toast({
        title: "Message cannot be empty",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    let key;
    if (file) {
      try {
        const presignedData = await getPreSignedUrl(file.name, file.type);
        if (!presignedData) throw new Error("Failed to get upload URL");
        
        const { url, fields } = presignedData;
        const formData = new FormData();
        Object.entries({ ...fields, file }).forEach(([k, v]) => formData.append(k, v));

        const response = await axios.post(url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.status !== 201) throw new Error("Failed to upload file");
        key = fields.key;
      } catch (error) {
        toast({
          title: error.message || "File upload failed",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }

    const data = {
      text: messageText,
      ConversationId: activeChatId,
      senderId: user._id,
      imageUrl: file && key ? `${awsHost}${key}` : null,
    };

    socket.emit("send-message", data);
    if (inputRef.current) inputRef.current.value = "";
    scrollToBottom();

    if (Array.isArray(myChatList)) {
      const updatedChatList = myChatList
        .map((chat) => {
          if (chat._id === activeChatId) {
            return {
              ...chat,
              latestmessage: messageText,
              updatedAt: new Date().toISOString(),
            };
          }
          return chat;
        })
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setMyChatList(updatedChatList);
    }
  };

  const removeMessageFromList = (messageId) => {
    setMessageList((prev) => prev.filter((msg) => msg._id !== messageId));
  };

  return (
    <Flex
      direction="column"
      h="100vh"
      w={{ base: "100vw", md: "100%" }}
      bg={colorMode === "dark" ? "gray.800" : "gray.50"}
    >
      {activeChatId ? (
        <>
          <ChatAreaTop />
          
          {isChatLoading && <ChatLoadingSpinner />}

          <VStack
            ref={chatContainerRef}
            flex={1}
            overflowY="auto"
            spacing={3}
            p={4}
            sx={scrollbarConfig}
            align="stretch"
          >
            {Array.isArray(messageList) && messageList.map((message) =>
              !message.deletedby?.includes(user?._id) ? (
                <SingleMessage
                  key={message._id}
                  message={message}
                  user={user}
                  receiver={receiver}
                  markdownToHtml={markdownToHtml}
                  scrollbarconfig={scrollbarConfig}
                  socket={socket}
                  activeChatId={activeChatId}
                  removeMessageFromList={removeMessageFromList}
                  toast={toast}
                />
              ) : null
            )}
          </VStack>

          <Box
            p={4}
            borderTop="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            bg={colorMode === "dark" ? "gray.800" : "white"}
            boxShadow="sm"
          >
            <Flex align="center" mb={2}>
              {isOtherUserTyping && (
                <Lottie
                  options={defaultOptions}
                  height={24}
                  width={24}
                  isStopped={false}
                  isPaused={false}
                />
              )}
            </Flex>
            
            <FormControl>
              <InputGroup size="md">
                {receiver && !receiver?.email?.includes("bot") && (
                  <InputLeftElement>
                    <Button
                      size="sm"
                      onClick={onOpen}
                      colorScheme="blue"
                      variant="ghost"
                      color={colorMode === "dark" ? "gray.300" : "gray.600"}
                    >
                      <FaFileUpload />
                    </Button>
                  </InputLeftElement>
                )}
                
                <Input
                  ref={inputRef}
                  placeholder="Type a message..."
                  onChange={handleTyping}
                  onKeyDown={handleKeyPress}
                  borderRadius="full"
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  color={colorMode === "dark" ? "white" : "gray.800"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  _hover={{
                    borderColor: colorMode === "dark" ? "gray.500" : "gray.400",
                  }}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px #3182ce",
                  }}
                  _placeholder={{
                    color: colorMode === "dark" ? "gray.400" : "gray.500",
                  }}
                />
                
                <InputRightElement>
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    colorScheme="blue"
                    borderRadius="full"
                    px={4}
                  >
                    <ArrowForwardIcon />
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </Box>
          
          <FileUploadModal
            isOpen={isOpen}
            onClose={onClose}
            handleSendMessage={handleSendMessage}
          />
        </>
      ) : (
        !isChatLoading && (
          <Flex
            display={{ base: "none", md: "flex" }}
            flex={1}
            align="center"
            justify="center"
            direction="column"
            textAlign="center"
            p={4}
          >
            <Text
              fontSize={{ base: "4xl", md: "6xl" }}
              fontWeight="extrabold"
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
            >
              Conversa
            </Text>
            <Text 
              fontSize={{ base: "lg", md: "xl" }} 
              color={colorMode === "dark" ? "gray.300" : "gray.600"} 
              mt={2}
            >
              Your Online Chatting Experience
            </Text>
            <Text 
              fontSize="md" 
              color={colorMode === "dark" ? "gray.400" : "gray.500"} 
              mt={1}
            >
              Select a chat to start messaging
            </Text>
          </Flex>
        )
      )}
    </Flex>
  );
};