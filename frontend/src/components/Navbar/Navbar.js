import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Link,
  useDisclosure,
  useColorMode,
  useBreakpointValue,
  IconButton,
  Tooltip,
  SlideFade,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from "@chakra-ui/react";
import { FaGithub, FaMoon, FaSun, FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import chatContext from "../../context/chatContext";

const Navbar = ({ toggleColorMode }) => {
  const context = useContext(chatContext);
  const { isAuthenticated, user, setIsAuthenticated } = context;
  const { colorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const toast = useToast();
  
  const [icon, setIcon] = useState(colorMode === "dark" ? <FaSun /> : <FaMoon />);
  const path = window.location.pathname;

  useEffect(() => {
    setIcon(colorMode === "dark" ? <FaSun /> : <FaMoon />);
  }, [colorMode]);

  const handleToggle = () => {
    toggleColorMode();
    setIcon(colorMode === "dark" ? <FaMoon /> : <FaSun />);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    toast({
      title: "Logged out successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const ProfileMenu = () => (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        borderRadius="full"
        p={0}
        ml={2}
      >
        <Avatar
          size="sm"
          name={user?.name}
          src={user?.pic}
          icon={<FaUserCircle fontSize="1.2rem" />}
        />
      </MenuButton>
      <MenuList>
        <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  );

  return (
    <>
      {/* Mobile View */}
      {!path.includes("dashboard") && isMobile && (
        <Box
          position="fixed"
          top={4}
          left={4}
          zIndex="dropdown"
          display="flex"
          gap={2}
        >
          <Tooltip label={colorMode === "dark" ? "Light mode" : "Dark mode"}>
            <IconButton
              aria-label="Toggle color mode"
              icon={icon}
              onClick={handleToggle}
              variant="ghost"
              borderRadius="full"
              size="sm"
            />
          </Tooltip>
          <Tooltip label="View GitHub repository">
            <IconButton
              as={Link}
              href="https://github.com/"
              target="_blank"
              aria-label="GitHub repository"
              icon={<FaGithub />}
              variant="ghost"
              borderRadius="full"
              size="sm"
            />
          </Tooltip>
        </Box>
      )}

      {/* Desktop View */}
      {!isMobile && (
        <Box
          p={3}
          w="full"
          mx="auto"
          maxW="container.xl"
          borderRadius="lg"
          bg={colorMode === "dark" ? "gray.800" : "white"}
          boxShadow="sm"
          position="sticky"
          top={2}
          zIndex="sticky"
        >
          <Flex justify="space-between" align="center">
            <Text fontSize="xl" fontWeight="bold" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
            Health Assistant
            </Text>

            <Flex align="center" gap={2}>
              <Tooltip label={colorMode === "dark" ? "Light mode" : "Dark mode"}>
                <IconButton
                  aria-label="Toggle color mode"
                  icon={icon}
                  onClick={handleToggle}
                  variant="ghost"
                  borderRadius="full"
                  size="sm"
                />
              </Tooltip>
              
              <Tooltip label="View GitHub repository">
                <IconButton
                  as={Link}
                  href="https://github.com/"
                  target="_blank"
                  aria-label="GitHub repository"
                  icon={<FaGithub />}
                  variant="ghost"
                  borderRadius="full"
                  size="sm"
                />
              </Tooltip>

              {isAuthenticated && (
                <SlideFade in={isAuthenticated} offsetY={-10}>
                  <ProfileMenu />
                </SlideFade>
              )}
            </Flex>
          </Flex>
        </Box>
      )}
    </>
  );
};

export default Navbar;