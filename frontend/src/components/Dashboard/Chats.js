import React, { useState } from "react";
import { 
  Tabs, 
  TabList, 
  Tab, 
  TabPanel, 
  TabPanels, 
  Box,
  useColorModeValue,
  SlideFade,
} from "@chakra-ui/react";
import MyChatList from "./MyChatList";
import NewChats from "./NewChats";

const Chats = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Dynamic colors based on light/dark mode
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tabHoverBg = useColorModeValue("purple.100", "purple.900");

  return (
    <Box
      w={{ base: "100vw", md: "30vw" }}
      h={{ base: "100vh", md: "90vh" }}
      bg={bgColor}
      borderRadius={{ base: 0, md: "lg" }}
      boxShadow={{ base: "none", md: "md" }}
      overflow="hidden"
      transition="all 0.3s ease"
    >
      <Tabs
        isFitted
        variant="soft-rounded"
        index={activeTab}
        onChange={(index) => setActiveTab(index)}
        colorScheme="purple"
        h="100%"
        display="flex"
        flexDirection="column"
      >
        <TabList 
          px={4} 
          pt={4}
          borderBottomWidth="1px"
          borderBottomColor={borderColor}
        >
          <Tab
            fontWeight="medium"
            _hover={{ bg: tabHoverBg }}
            _selected={{ 
              bg: "purple.500", 
              color: "white",
              transform: "scale(1.05)",
            }}
            transition="all 0.2s ease"
            borderRadius="md"
            m={1}
          >
            My Chats
          </Tab>
          <Tab
            fontWeight="medium"
            _hover={{ bg: tabHoverBg }}
            _selected={{ 
              bg: "purple.500", 
              color: "white",
              transform: "scale(1.05)",
            }}
            transition="all 0.2s ease"
            borderRadius="md"
            m={1}
          >
            New Chats
          </Tab>
        </TabList>

        <TabPanels flex="1" overflowY="auto">
          <TabPanel p={0} h="100%">
            <SlideFade in={activeTab === 0} offsetY="20px">
              <Box
                px={{ base: 2, md: 4 }}
                py={2}
                h="100%"
                overflowY="auto"
                css={{
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "purple.300",
                    borderRadius: "4px",
                  },
                }}
              >
                <MyChatList setactiveTab={setActiveTab} />
              </Box>
            </SlideFade>
          </TabPanel>
          
          <TabPanel p={0} h="100%">
            <SlideFade in={activeTab === 1} offsetY="20px">
              <Box
                px={{ base: 2, md: 4 }}
                py={2}
                h="100%"
                overflowY="auto"
                css={{
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "purple.300",
                    borderRadius: "4px",
                  },
                }}
              >
                <NewChats setactiveTab={setActiveTab} />
              </Box>
            </SlideFade>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Chats;