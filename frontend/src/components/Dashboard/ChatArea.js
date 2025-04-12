import React, { useState, useEffect, useContext, useRef } from "react";
import { ArrowForwardIcon, AttachmentIcon, CloseIcon } from "@chakra-ui/icons";
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
  HStack,
  IconButton,
  SlideFade,
  useBreakpointValue,
  Badge,
  Avatar,
  Tooltip,
  ScaleFade,
  Container,
  Portal,
  ClickableOverlay,
} from "@chakra-ui/react";
import { FaFileUpload, FaPaperPlane, FaSmile, FaTimes } from "react-icons/fa";
import { marked } from "marked";
import chatContext from "../../context/chatContext";
import ChatAreaTop from "./ChatAreaTop";
import FileUploadModal from "../miscellaneous/FileUploadModal";
import ChatLoadingSpinner from "../miscellaneous/ChatLoadingSpinner";
import axios from "axios";
import SingleMessage from "./SingleMessage";
import EmojiPicker from "emoji-picker-react";

const scrollbarConfig = {
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "purple.300",
    borderRadius: "24px",
    transition: "background-color 0.2s",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "purple.400",
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const { colorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, sm: true, md: false });
  const isTablet = useBreakpointValue({ base: false, sm: true, md: true });
  
  // Responsive sizes
  const inputSize = useBreakpointValue({ base: "sm", sm: "md", md: "lg" });
  const iconSize = useBreakpointValue({ base: "xs", sm: "sm", md: "sm" });
  const paddingX = useBreakpointValue({ base: 2, sm: 3, md: 4 });
  const containerMaxWidth = useBreakpointValue({ base: "100%", md: "100%", lg: "100%" });
  
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

    const handlers = {
      "user-joined-room": (userId) => {
        setMessageList((prev) =>
          prev.map((message) => {
            if (message.senderId === user?._id && userId !== user?._id) {
              const index = message.seenBy?.findIndex((seen) => seen.user === userId);
              if (index === -1 && Array.isArray(message.seenBy)) {
                message.seenBy.push({ user: userId, seenAt: new Date() });
              }
            }
            return message;
          })
        );
      },
      "typing": (data) => {
        if (data.typer !== user?._id) setIsOtherUserTyping(true);
      },
      "stop-typing": (data) => {
        if (data.typer !== user?._id) setIsOtherUserTyping(false);
      },
      "receive-message": (data) => {
        setMessageList((prev) => [...prev, data]);
        scrollToBottom();
      },
      "message-deleted": (data) => {
        setMessageList((prev) => prev.filter((msg) => msg._id !== data.messageId));
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));
    return () => Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
  }, [socket, user, setMessageList, setIsOtherUserTyping]);

  useEffect(() => {
    // Scroll to bottom when message list changes
    scrollToBottom();
  }, [messageList]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        event.target.id !== "emoji-button"
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

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
      socket.emit("stop-typing", { typer: user?._id, ConversationId: activeChatId });
    } else if (inputRef.current.value !== "" && !typing) {
      setTyping(true);
      socket.emit("typing", { typer: user?._id, ConversationId: activeChatId });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    } else if (e.key === "Escape" && showEmojiPicker) {
      setShowEmojiPicker(false);
    }
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
        position: "top",
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
        position: "top",
      });
      return;
    }

    const awsHost = "https://Conversa-chat.s3.ap-south-1.amazonaws.com/";
    messageText = messageText || inputRef.current?.value || "";

    socket.emit("stop-typing", { typer: user._id, ConversationId: activeChatId });
    setTyping(false);
    setShowEmojiPicker(false);

    if (messageText.trim() === "" && !file) {
      toast({
        title: "Message cannot be empty",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
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
          position: "top",
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
              latestmessage: messageText || "📷 Photo",
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

  const onEmojiClick = (emojiData) => {
    if (inputRef.current) {
      const cursorPosition = inputRef.current.selectionStart;
      const textBeforeCursor = inputRef.current.value.substring(0, cursorPosition);
      const textAfterCursor = inputRef.current.value.substring(cursorPosition);
      
      inputRef.current.value = textBeforeCursor + emojiData.emoji + textAfterCursor;
      
      // Set cursor position after inserted emoji
      setTimeout(() => {
        inputRef.current.selectionStart = cursorPosition + emojiData.emoji.length;
        inputRef.current.selectionEnd = cursorPosition + emojiData.emoji.length;
        inputRef.current.focus();
      }, 0);
      
      handleTyping();
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    // Focus input after a short delay when closing emoji picker
    if (showEmojiPicker && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  };

  return (
    <Flex
      direction="column"
      h="100%"
      w="100%"
      maxW={containerMaxWidth}
      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
      borderRadius={{ base: 0, md: "xl" }}
      overflow="hidden"
      boxShadow={{ base: "none", md: "lg" }}
      transition="all 0.3s ease"
      position="relative"
    >
      {activeChatId ? (
        <>
          <ChatAreaTop />

          {isChatLoading && <ChatLoadingSpinner />}

          <VStack
            ref={chatContainerRef}
            flex={1}
            overflowY="auto"
            overflowX="hidden"
            spacing={3}
            px={paddingX}
            py={2}
            sx={scrollbarConfig}
            align="stretch"
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderTopRadius="inherit"
            w="100%"
          >
            {Array.isArray(messageList) &&
              messageList.map((message) =>
                !message.deletedby?.includes(user?._id) ? (
                  <SlideFade key={message._id} in={true} offsetY="20px">
                    <SingleMessage
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
                  </SlideFade>
                ) : null
              )}
          </VStack>

          <Box
            px={paddingX}
            py={3}
            borderTop="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            bg={colorMode === "dark" ? "gray.800" : "white"}
            boxShadow="0 -4px 12px rgba(0, 0, 0, 0.05)"
            w="100%"
            position="relative"
          >
            <ScaleFade in={isOtherUserTyping} initialScale={0.9}>
              {isOtherUserTyping && (
                <Flex align="center" mb={2} pl={2}>
                  <Avatar size="xs" name={receiver?.name} src={receiver?.pic} mr={2} />
                  <Box maxW="48px">
                    <Lottie
                      options={defaultOptions}
                      height={24}
                      width={48}
                      isStopped={!isOtherUserTyping}
                      isPaused={!isOtherUserTyping}
                    />
                  </Box>
                  <Text fontSize="sm" color="gray.500" isTruncated>
                    {receiver?.name} is typing...
                  </Text>
                </Flex>
              )}
            </ScaleFade>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <Box 
                ref={emojiPickerRef}
                position="absolute" 
                bottom="60px" 
                left={isMobile ? "50%" : "10px"} 
                transform={isMobile ? "translateX(-50%)" : "none"}
                zIndex={10}
                boxShadow="xl" 
                borderRadius="lg" 
                overflow="hidden"
                bg={colorMode === "dark" ? "gray.700" : "white"}
                border="1px solid"
                borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                width={isMobile ? "90%" : "320px"}
              >
                <Flex 
                  justify="space-between" 
                  align="center" 
                  p={2} 
                  borderBottom="1px" 
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  bg={colorMode === "dark" ? "gray.800" : "gray.100"}
                >
                  <Text fontSize="sm" fontWeight="medium">Emoji Picker</Text>
                  <IconButton
                    aria-label="Close emoji picker"
                    icon={<CloseIcon />}
                    size="xs"
                    onClick={() => setShowEmojiPicker(false)}
                    variant="ghost"
                    colorScheme="purple"
                  />
                </Flex>
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  width="100%"
                  height={isMobile ? "280px" : "320px"}
                  previewConfig={{ showPreview: false }}
                  skinTonesDisabled
                  searchDisabled={isMobile}
                  theme={colorMode === "dark" ? "dark" : "light"}
                />
              </Box>
            )}

            <FormControl position="relative">
              <InputGroup size={inputSize}>
                {!isMobile ? (
                  <HStack 
                    spacing={1} 
                    position="absolute" 
                    left={isMobile ? "5px" : "10px"} 
                    top="50%" 
                    transform="translateY(-50%)" 
                    zIndex={2}
                  >
                    <Tooltip label="Attach file" placement="top">
                      <IconButton
                        aria-label="Attach file"
                        icon={<AttachmentIcon />}
                        onClick={onOpen}
                        variant="ghost"
                        colorScheme="purple"
                        size={iconSize}
                        borderRadius="full"
                        _hover={{ bg: "purple.100" }}
                      />
                    </Tooltip>
                    <Tooltip label={showEmojiPicker ? "Close emoji picker" : "Add emoji"} placement="top">
                      <IconButton
                        id="emoji-button"
                        aria-label="Add emoji"
                        icon={showEmojiPicker ? <FaTimes /> : <FaSmile />}
                        onClick={toggleEmojiPicker}
                        variant="ghost"
                        colorScheme="purple"
                        size={iconSize}
                        borderRadius="full"
                        _hover={{ bg: "purple.100" }}
                      />
                    </Tooltip>
                  </HStack>
                ) : (
                  <InputLeftElement>
                    <IconButton
                      id="emoji-button"
                      aria-label={showEmojiPicker ? "Close emoji picker" : "Add emoji"}
                      icon={showEmojiPicker ? <FaTimes /> : <FaSmile />}
                      onClick={toggleEmojiPicker}
                      variant="ghost"
                      colorScheme="purple"
                      size="xs"
                      borderRadius="full"
                    />
                  </InputLeftElement>
                )}

                <Input
                  ref={inputRef}
                  placeholder="Type a message..."
                  onChange={handleTyping}
                  onKeyDown={handleKeyPress}
                  borderRadius="full"
                  pl={isMobile ? "40px" : "80px"}
                  pr="60px"
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  _hover={{
                    borderColor: "purple.300",
                    boxShadow: "0 0 0 1px rgba(128, 90, 213, 0.3)",
                  }}
                  _focus={{
                    borderColor: "purple.500",
                    boxShadow: "0 0 0 2px rgba(128, 90, 213, 0.5)",
                  }}
                  _placeholder={{ color: colorMode === "dark" ? "gray.400" : "gray.500" }}
                  transition="all 0.2s ease"
                  maxLength={1000}
                />

                <InputRightElement width="fit-content" pr={2}>
                  {isMobile && (
                    <IconButton
                      aria-label="Attach file"
                      icon={<AttachmentIcon />}
                      onClick={onOpen}
                      variant="ghost"
                      colorScheme="purple"
                      size="xs"
                      borderRadius="full"
                      mr={1}
                    />
                  )}
                  <IconButton
                    aria-label="Send message"
                    icon={<FaPaperPlane />}
                    onClick={handleSendMessage}
                    size={isMobile ? "sm" : "md"}
                    colorScheme="purple"
                    borderRadius="full"
                    variant="solid"
                    _hover={{ transform: "scale(1.1)" }}
                    transition="all 0.2s ease"
                  />
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
            flex={1}
            align="center"
            justify="center"
            direction="column"
            p={{ base: 4, md: 8 }}
            bgGradient={colorMode === "dark" ? "linear(to-b, gray.900, gray.800)" : "linear(to-b, gray.50, white)"}
          >
            <ScaleFade initialScale={0.9} in={true}>
              <Box maxW={{ base: "100%", md: "400px" }} textAlign="center">
                <Text
                  fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                  fontWeight="extrabold"
                  bgGradient="linear(to-r, purple.400, purple.600)"
                  bgClip="text"
                  mb={4}
                  lineHeight="1.1"
                >
                Health Assistant
                </Text>
                <Text
                  fontSize={{ base: "sm", sm: "md", md: "lg" }}
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  mb={6}
                  px={2}
                >
                  Start a Conversation or select an existing one to begin chatting
                </Text>

                <HStack spacing={{ base: 2, md: 3 }} justify="center" mb={6} flexWrap="wrap">
                  <Badge variant="subtle" colorScheme="purple" px={3} py={1} borderRadius="full">
                    Secure
                  </Badge>
                  <Badge variant="subtle" colorScheme="purple" px={3} py={1} borderRadius="full">
                    Real-time
                  </Badge>
                  <Badge variant="subtle" colorScheme="purple" px={3} py={1} borderRadius="full">
                    Reliable
                  </Badge>
                </HStack>

                <Box
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  p={{ base: 3, md: 6 }}
                  borderRadius="xl"
                  boxShadow="md"
                  borderWidth="1px"
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  width={{ base: "95%", sm: "auto" }}
                  mx="auto"
                >
                  <Text fontSize={{ base: "sm", md: "md" }} color={colorMode === "dark" ? "gray.300" : "gray.600"} mb={2}>
                    Your messages will appear here
                  </Text>
                  <Text fontSize={{ base: "xs", md: "sm" }} color={colorMode === "dark" ? "gray.400" : "gray.500"}>
                    Select a chat from the left panel
                  </Text>
                </Box>
              </Box>
            </ScaleFade>
          </Flex>
        )
      )}
      
      {/* Backdrop to close emoji picker when clicking outside */}
      {showEmojiPicker && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0" 
          bottom="0"
          bg="transparent"
          zIndex={5}
          onClick={() => setShowEmojiPicker(false)}
        />
      )}
    </Flex>
  );
};