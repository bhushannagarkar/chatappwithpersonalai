import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Container,
  VStack,
  Heading,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react";
import { FaComment, FaGithub, FaUserPlus, FaSignInAlt } from "react-icons/fa";
import Auth from "./Authentication/Auth";
import chatContext from "../context/chatContext";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  // context
  const context = useContext(chatContext);
  const { isAuthenticated } = context;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [index, setindex] = useState(0);
  const navigator = useNavigate();
  
  // Colors
  const bgGradient = "linear(to-r, purple.500, blue.500)";
  const buttonBg = useColorModeValue("purple.500", "purple.300");
  const buttonHoverBg = useColorModeValue("purple.600", "purple.400");
  const secondaryButtonBg = useColorModeValue("white", "gray.700");
  const secondaryButtonColor = useColorModeValue("purple.500", "purple.300");
  const boxBg = useColorModeValue("white", "gray.800");
  const boxShadow = "0px 4px 20px rgba(0, 0, 0, 0.1)";
  const textColor = useColorModeValue("gray.600", "gray.300");
  const descriptionColor = useColorModeValue("gray.600", "gray.400");
  const featureBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (isAuthenticated) {
      navigator("/dashboard");
    }
  }, [isAuthenticated, navigator]);

  const handleloginopen = () => {
    setindex(0);
    onOpen();
  };

  const handlesignupopen = () => {
    setindex(1);
    onOpen();
  };

  const features = [
    { title: "Real-time Chat", description: "Connect instantly with friends" },
    { title: "Secure Communication", description: "End-to-end encryption" },
    { title: "Multimedia Sharing", description: "Share photos and files easily" }
  ];

  return (
    <Box minH="100vh" position="relative" overflow="hidden">
      {/* Background gradient overlay */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient={bgGradient}
        opacity="0.05"
        zIndex="-1"
      />

      {/* Decorative circles */}
      <Box
        position="absolute"
        top="-100px"
        right="-100px"
        width="300px"
        height="300px"
        borderRadius="full"
        bgGradient={bgGradient}
        opacity="0.1"
        zIndex="-1"
      />
      <Box
        position="absolute"
        bottom="-150px"
        left="-150px"
        width="400px"
        height="400px"
        borderRadius="full"
        bgGradient={bgGradient}
        opacity="0.07"
        zIndex="-1"
      />

      {/* Main content */}
      <Container maxW="container.xl" py={{ base: 10, md: 20 }}>
        <Flex 
          direction={{ base: "column", lg: "row" }} 
          align="center" 
          justify="space-between"
          minH="80vh"
          gap={{ base: 12, lg: 6 }}
        >
          {/* Left side - Hero content */}
          <VStack 
            spacing={6} 
            align={{ base: "center", lg: "flex-start" }}
            textAlign={{ base: "center", lg: "left" }}
            w={{ base: "100%", lg: "50%" }}
          >
            <Box mb={4}>
              <Flex align="center" justify={{ base: "center", lg: "flex-start" }}>
                <FaComment color="var(--chakra-colors-purple-500)" size={40} style={{ marginRight: '8px' }} />
                <Heading 
                  as="h1" 
                  fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }} 
                  fontWeight="bold" 
                  bgGradient={bgGradient}
                  bgClip="text"
                  letterSpacing="tight"
                >
             Health Assistant
                </Heading>
              </Flex>
              <Text 
                fontSize={{ base: "lg", md: "xl" }} 
                fontWeight="medium" 
                mt={2} 
                color={textColor}
              >
                Connect. Chat. Collaborate.
              </Text>
            </Box>

            <Text 
              fontSize={{ base: "md", md: "lg" }}
              maxW="500px"
              color={descriptionColor}
              mb={4}
            >
              Experience the next generation of real-time communication with Health Assistant. 
              Connect with friends, family, and colleagues in a sleek, intuitive environment.
            </Text>

            <HStack spacing={4} width="100%" justify={{ base: "center", lg: "flex-start" }}>
              <Button
                size={{ base: "md", md: "lg" }}
                px={8}
                bg={buttonBg}
                color="white"
                _hover={{ bg: buttonHoverBg, transform: "translateY(-2px)" }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
                fontWeight="semibold"
                leftIcon={<FaSignInAlt />}
                onClick={handleloginopen}
                boxShadow="md"
                borderRadius="full"
              >
                Login
              </Button>
              <Button
                size={{ base: "md", md: "lg" }}
                px={8}
                bg={secondaryButtonBg}
                color={secondaryButtonColor}
                borderColor={secondaryButtonColor}
                borderWidth="1px"
                _hover={{ bg: "rgba(159, 122, 234, 0.1)", transform: "translateY(-2px)" }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
                fontWeight="semibold"
                leftIcon={<FaUserPlus />}
                onClick={handlesignupopen}
                borderRadius="full"
              >
                Sign Up
              </Button>
            </HStack>
          </VStack>

          {/* Right side - App preview */}
          <Box 
            w={{ base: "100%", lg: "50%" }} 
            display="flex" 
            justifyContent="center"
            alignItems="center"
          >
            <Box
              bg={boxBg}
              borderRadius="xl"
              boxShadow={boxShadow}
              overflow="hidden"
              maxW={{ base: "90%", md: "400px" }}
              transform={{ base: "none", md: "rotate(2deg)" }}
              transition="all 0.3s"
              _hover={{ transform: "rotate(0deg) scale(1.02)" }}
            >
              <Box bg="purple.500" p={4}>
                <Text color="white" fontWeight="bold">Health Assistant Chat</Text>
              </Box>
              <Box p={6}>
                <VStack spacing={4} align="stretch">
                  {features.map((feature, idx) => (
                    <Box key={idx} p={4} bg={featureBg} borderRadius="md">
                      <Text fontWeight="bold">{feature.title}</Text>
                      <Text fontSize="sm" color={textColor}>
                        {feature.description}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Container>

      {/* Footer */}
      <Box py={6} textAlign="center" borderTopWidth="1px" borderColor={borderColor}>
        <Container maxW="container.xl">
          <Text fontSize="sm" color={descriptionColor}>
            &copy; 2025 Health Assistant. All rights reserved.
            <Link to="https://github.com" target="_blank">
              <Button 
                variant="link" 
                colorScheme="purple" 
                size="sm" 
                ml={1} 
                rightIcon={<FaGithub />}
              >
                someone
              </Button>
            </Link>
          </Text>
        </Container>
      </Box>

      {/* Auth Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "full", sm: "md", md: "xl" }}
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent 
          w={{ base: "95%", sm: "90%", md: "auto" }}
          mx="auto"
          borderRadius="xl"
          boxShadow="xl"
          overflow="hidden"
        >
          <ModalHeader 
            bgGradient={bgGradient} 
            color="white"
            py={4}
          >
            {index === 0 ? "Welcome Back" : "Join Health Assistant"}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={{ base: 4, md: 6 }}>
            <Auth tabindex={index} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Home;