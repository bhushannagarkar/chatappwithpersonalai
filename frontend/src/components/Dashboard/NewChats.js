import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Divider,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Button,
  useColorModeValue,
  ScaleFade,
  Tooltip,
} from "@chakra-ui/react";
import {
  AddIcon,
  ArrowBackIcon,
  ChevronRightIcon,
  Search2Icon,
} from "@chakra-ui/icons";
import chatContext from "../../context/chatContext";

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

const NewChats = (props) => {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState(data);
  const context = useContext(chatContext);
  const {
    hostName,
    socket,
    user,
    myChatList,
    setMyChatList,
    setReceiver,
    setActiveChatId,
  } = context;

  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("purple.50", "purple.900");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const fetchNonFriendsList = async () => {
    try {
      const response = await fetch(`${hostName}/user/non-friends`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch non-friends list");
      const jsonData = await response.json();
      setData(jsonData);
      setUsers(jsonData);
    } catch (error) {
      console.error("Error fetching non-friends list:", error);
    }
  };

  useEffect(() => {
    fetchNonFriendsList();
  }, [myChatList]);

  const handleUserSearch = (e) => {
    const query = e.target.value.toLowerCase();
    if (query) {
      const filteredUsers = data.filter((user) =>
        user.name.toLowerCase().includes(query)
      );
      setUsers(filteredUsers);
    } else {
      setUsers(data);
    }
  };

  const handleNewChat = async (e, receiverid) => {
    e.preventDefault();
    const payload = { members: [user._id, receiverid] };
    try {
      const response = await fetch(`${hostName}/Conversation/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to create Conversation");
      const data = await response.json();

      setMyChatList([data, ...myChatList]);
      setReceiver(data.members[0]);
      setActiveChatId(data._id);
      props.setactiveTab(0);

      socket.emit("join-chat", {
        roomId: data._id,
        userId: user._id,
      });

      setUsers((prevUsers) => prevUsers.filter((u) => u._id !== receiverid));
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  return (
    <Box
      h="100%"
      bg={bgColor}
      borderRadius={{ base: 0, md: "lg" }}
      overflow="hidden"
      boxShadow={{ base: "none", md: "md" }}
      display="flex"
      flexDirection="column"
    >
      <Flex
        p={{ base: 2, md: 4 }}
        justify="space-between"
        align="center"
        borderBottomWidth="1px"
        borderColor={borderColor}
      >
        <Button
          onClick={() => props.setactiveTab(0)}
          variant="ghost"
          colorScheme="purple"
          leftIcon={<ArrowBackIcon />}
          size="md"
          _hover={{ bg: hoverBg }}
        >
          Back
        </Button>
        <InputGroup maxW={{ base: "70%", md: "300px" }} size="md">
          <InputLeftElement>
            <Search2Icon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search users"
            onChange={handleUserSearch}
            borderRadius="full"
            bg={useColorModeValue("gray.100", "gray.700")}
            _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
          />
        </InputGroup>
      </Flex>

      <Box flex={1} overflowY="auto" px={{ base: 2, md: 3 }} py={2} sx={scrollbarConfig}>
        <Button
          colorScheme="purple"
          size="md"
          borderRadius="full"
          leftIcon={<AddIcon />}
          mb={3}
          w="full"
          _hover={{ transform: "scale(1.02)" }}
          transition="all 0.2s"
        >
          Create New Group
        </Button>

        {users.map(
          (u) =>
            u._id !== user._id && (
              <ScaleFade key={u._id} initialScale={0.95} in={true}>
                <Flex
                  p={2}
                  borderRadius="md"
                  _hover={{ bg: hoverBg }}
                  transition="all 0.2s"
                  cursor="pointer"
                  onClick={(e) => handleNewChat(e, u._id)}
                >
                  <Flex align="center" flex={1}>
                    <Box flexShrink={0}>
                      <img
                        src={u.profilePic || "https://cdn.pixabay.com/photo/2023/06/15/15/37/ai-8063177_1280.jpg"}
                        alt="profile"
                        style={{
                          width: "45px",
                          height: "45px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                    <Box ml={3} flex={1} minW={0}>
                      <Text
                        fontSize="md"
                        fontWeight="medium"
                        color={textColor}
                        noOfLines={1}
                      >
                        {u.name}
                      </Text>
                      <Text fontSize="sm" color={subTextColor} noOfLines={1}>
                        {u.phoneNum}
                      </Text>
                    </Box>
                  </Flex>
                  <Tooltip label="Start chat" placement="left">
                    <Button
                      variant="ghost"
                      colorScheme="purple"
                      size="sm"
                      rightIcon={<ChevronRightIcon />}
                      _hover={{ bg: "purple.100" }}
                    />
                  </Tooltip>
                </Flex>
              </ScaleFade>
            )
        )}
      </Box>
    </Box>
  );
};

export default NewChats;