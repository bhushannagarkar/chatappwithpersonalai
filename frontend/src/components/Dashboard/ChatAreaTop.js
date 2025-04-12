import {
  Box,
  Flex,
  Text,
  Button,
  Avatar,
  Tooltip,
  SkeletonCircle,
  Skeleton,
  Badge,
  useColorMode,
  useBreakpointValue,
  IconButton,
  SlideFade,
  useDisclosure,
} from "@chakra-ui/react";
import { ArrowBackIcon, ChevronDownIcon } from "@chakra-ui/icons";
import React, { useContext, useEffect } from "react";
import chatContext from "../../context/chatContext";
import { ProfileModal } from "../miscellaneous/ProfileModal";

const ChatAreaTop = () => {
  const context = useContext(chatContext);
  const { colorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const {
    receiver,
    setReceiver,
    activeChatId,
    setActiveChatId,
    setMessageList,
    isChatLoading,
    hostName,
    socket,
  } = context;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const getReceiverOnlineStatus = async () => {
    if (!receiver._id) return;

    try {
      const response = await fetch(
        `${hostName}/user/online-status/${receiver._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      setReceiver((prev) => ({
        ...prev,
        isOnline: data.isOnline,
        lastSeen: data.lastSeen || prev.lastSeen,
      }));
    } catch (error) {
      console.error("Error fetching online status:", error);
    }
  };

  const handleBack = () => {
    socket.emit("leave-chat", activeChatId);
    setActiveChatId("");
    setMessageList([]);
    setReceiver({});
  };

  const getLastSeenString = (lastSeen) => {
    if (!lastSeen) return "never been online";
    
    const now = new Date();
    const seenDate = new Date(lastSeen);
    const diffInHours = Math.floor((now - seenDate) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - seenDate) / (1000 * 60));
      return `last seen ${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `last seen ${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (seenDate.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString()) {
      return "last seen yesterday";
    } else {
      return `last seen on ${seenDate.toLocaleDateString()}`;
    }
  };

  useEffect(() => {
    getReceiverOnlineStatus();
  }, [receiver?._id]);

  return (
    <Box
      width="100%"
      bg={colorMode === "dark" ? "gray.800" : "white"}
      borderBottomWidth="1px"
      borderBottomColor={colorMode === "dark" ? "gray.700" : "gray.200"}
      boxShadow="sm"
      position="relative"
      zIndex={1}
    >
      <Flex
        width="100%"
        height="72px"
        alignItems="center"
        px={{ base: 2, md: 4 }}
        py={2}
      >
        {isMobile && (
          <IconButton
            icon={<ArrowBackIcon />}
            onClick={handleBack}
            variant="ghost"
            aria-label="Back to chats"
            mr={2}
            borderRadius="full"
          />
        )}

        {isChatLoading ? (
          <Flex alignItems="center" flex={1}>
            <SkeletonCircle size="12" />
            <Box ml={3} flex={1}>
              <Skeleton height="20px" width="70%" mb={2} />
              <Skeleton height="14px" width="50%" />
            </Box>
          </Flex>
        ) : (
          <Tooltip
            label={receiver.isOnline ? "Online now" : getLastSeenString(receiver.lastSeen)}
            placement="bottom-start"
            hasArrow
          >
            <Button
              flex={1}
              height="100%"
              variant="ghost"
              onClick={onOpen}
              display="flex"
              alignItems="center"
              justifyContent="flex-start"
              px={3}
              borderRadius="lg"
              _hover={{
                bg: colorMode === "dark" ? "gray.700" : "gray.100",
              }}
              _active={{
                bg: colorMode === "dark" ? "gray.600" : "gray.200",
              }}
              rightIcon={!isMobile ? <ChevronDownIcon /> : null}
            >
              <Avatar
                size="md"
                name={receiver.name}
                src={receiver.profilePic}
                mr={3}
              />
              <Box textAlign="left">
                <Flex alignItems="center">
                  <Text
                    fontSize={{ base: "md", md: "lg" }}
                    fontWeight="semibold"
                    noOfLines={1}
                    mr={2}
                  >
                    {receiver.name}
                  </Text>
                  {receiver.isOnline && (
                    <SlideFade in={receiver.isOnline} offsetY={-5}>
                      <Badge
                        colorScheme="green"
                        variant="subtle"
                        fontSize="xx-small"
                        borderRadius="full"
                        px={2}
                      >
                        Online
                      </Badge>
                    </SlideFade>
                  )}
                </Flex>
                {!receiver.isOnline && (
                  <Text
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.400" : "gray.500"}
                    mt={0.5}
                  >
                    {getLastSeenString(receiver.lastSeen)}
                  </Text>
                )}
              </Box>
            </Button>
          </Tooltip>
        )}
      </Flex>

      <ProfileModal isOpen={isOpen} onClose={onClose} user={receiver} />
    </Box>
  );
};

export default ChatAreaTop;