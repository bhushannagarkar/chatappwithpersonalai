import React, { useEffect, useContext, useState } from "react";
import {
  Box,
  Divider,
  Flex,
  useToast,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import chatContext from "../../context/chatContext";
import Chats from "./Chats";
import { ChatArea } from "./ChatArea";

const Dashboard = () => {
  const context = useContext(chatContext);
  const { user, isAuthenticated, activeChatId } = context;
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Responsive width calculations
  const chatListWidth = useBreakpointValue({ base: "100%", md: "29vw" });
  const chatAreaWidth = useBreakpointValue({ base: "100%", md: "71vw" });
  const containerHeight = useBreakpointValue({ base: "85vh", md: "90vh" });
  const showChatArea = useBreakpointValue({ 
    base: activeChatId !== "", 
    md: true 
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please login to continue",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        navigate("/");
        return;
      }

      try {
        await user; // Wait for user data
        setIsLoading(false);
      } catch (error) {
        toast({
          title: "Error loading user data",
          description: "Please try again",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate("/");
      }
    };

    const timer = setTimeout(checkAuth, 1000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate, toast, user]);

  // Loading skeleton
  if (isLoading) {
    return (
      <Box
        display="flex"
        p={3}
        w="99%"
        h={containerHeight}
        borderRadius="lg"
        borderWidth="1px"
        m="auto"
        mt={2}
      >
        {/* Chat list skeleton */}
        <Box h="80vh" w={chatListWidth} mt={10} mx={2}>
          <Divider mb={5} />
          <Stack spacing={3}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton height="50px" key={`skeleton-${i}`} borderRadius="lg" />
            ))}
          </Stack>
        </Box>

        {/* Chat area skeleton (hidden on mobile) */}
        <Box 
          h="80vh" 
          w={chatAreaWidth} 
          display={{ base: "none", md: "block" }}
        >
          <Stack mt={5} spacing={4}>
            <SkeletonCircle size="10" mx={2} />
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonText
                key={`text-skeleton-${i}`}
                mt={4}
                mx={2}
                noOfLines={4}
                spacing={4}
                borderRadius="lg"
              />
            ))}
          </Stack>
        </Box>
      </Box>
    );
  }

  // Main content
  return (
    <Box
      p={0}
      w={{ base: "100vw", md: "98vw" }}
      h={containerHeight}
      m="0 auto"
      borderRadius="lg"
      borderWidth={{ base: "0", md: "2px" }}
      overflow="hidden"
    >
      <Flex h="100%">
        {/* Chat list */}
        <Box
          display={{
            base: activeChatId ? "none" : "block",
            md: "block",
          }}
          w={chatListWidth}
          minW={{ md: "300px" }}
          borderRight={{ md: "1px solid" }}
          borderColor={{ md: "gray.200" }}
        >
          <Chats />
        </Box>

        {/* Chat area */}
        {showChatArea && (
          <Box
            h="100%"
            w={chatAreaWidth}
            minW="0" // Fixes flexbox overflow issues
            flex="1"
          >
            <ChatArea />
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default Dashboard;