import { useState, useContext } from "react";
import {
  Flex,
  Heading,
  Input,
  Button,
  InputGroup,
  Stack,
  InputLeftElement,
  chakra,
  Box,
  Link,
  Avatar,
  FormControl,
  FormHelperText,
  InputRightElement,
  Card,
  CardBody,
  useToast,
  Spinner,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { FaUserAlt, FaLock, FaEnvelope } from "react-icons/fa";
import chatContext from "../../context/chatContext";

const CFaLock = chakra(FaLock);
const CFaEnvelope = chakra(FaEnvelope);
const CFaUserAlt = chakra(FaUserAlt);

const Signup = (props) => {
  const context = useContext(chatContext);
  const { hostName } = context;
  const toast = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmpassword: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmpassword: ""
  });

  const handletabs = props.handleTabsChange;

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const mutedColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgGradient = "linear(to-r, purple.400, purple.600)";
  const hoverBg = useColorModeValue("purple.50", "rgba(128, 90, 213, 0.12)");

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmpassword: ""
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (formData.name.length < 3 || formData.name.length > 20) {
      newErrors.name = "Name must be 3-20 characters";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    } else if (formData.email.length > 50) {
      newErrors.email = "Email too long";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8 || formData.password.length > 20) {
      newErrors.password = "Password must be 8-20 characters";
      isValid = false;
    }

    if (formData.password !== formData.confirmpassword) {
      newErrors.confirmpassword = "Passwords don't match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      email: formData.email,
      name: formData.name,
      password: formData.password
    };

    try {
      const response = await fetch(`${hostName}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const resdata = await response.json();

      if (!response.ok) {
        throw new Error(resdata.message || "Failed to create account");
      }

      localStorage.setItem("token", resdata.authtoken);
      handletabs(0);

      toast({
        title: "Account created!",
        description: "Welcome to our community!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
        variant: "solid",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
        variant: "solid",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex
      flexDirection="column"
      width="100%"
      minH="80vh"
      justifyContent="center"
      alignItems="center"
      px={{ base: 4, md: 8 }}
      py={8}
      position="relative"
      overflow="hidden"
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      {/* Decorative background elements */}
      <Box
        position="absolute"
        top="-10%"
        right="-10%"
        width="300px"
        height="300px"
        borderRadius="full"
        bgGradient={bgGradient}
        opacity="0.1"
        zIndex="-1"
      />
      <Box
        position="absolute"
        bottom="-15%"
        left="-10%"
        width="350px"
        height="350px"
        borderRadius="full"
        bgGradient={bgGradient}
        opacity="0.1"
        zIndex="-1"
      />

      <VStack spacing={6} width="100%" maxW="480px">
        <Avatar 
          size="xl" 
          bg="purple.500" 
          icon={<Icon as={FaUserAlt} color="white" w={8} h={8} />}
          shadow="lg"
        />
        
        <Heading 
          fontSize={{ base: "2xl", md: "3xl" }} 
          fontWeight="bold" 
          color={textColor}
          textAlign="center"
        >
          Create Your Account
        </Heading>
        
        <Text color={mutedColor} textAlign="center" pb={2} fontSize="md">
          Join our community and start your journey today
        </Text>

        <Card 
          width="100%" 
          borderRadius="xl" 
          bg={cardBg} 
          shadow="lg"
          borderWidth="1px"
          borderColor={borderColor}
          overflow="hidden"
        >
          <CardBody p={{ base: 6, md: 8 }}>
            <form onSubmit={handleSignup}>
              <VStack spacing={5}>
                <FormControl isInvalid={!!errors.name}>
                  <InputGroup size="lg">
                    <InputLeftElement
                      pointerEvents="none"
                      children={<CFaUserAlt color="gray.400" />}
                    />
                    <Input
                      name="name"
                      type="text"
                      placeholder="Full name"
                      value={formData.name}
                      bg={inputBg}
                      borderRadius="md"
                      focusBorderColor="purple.500"
                      onChange={handleInputChange}
                    />
                  </InputGroup>
                  <FormHelperText color="red.500" fontSize="sm">
                    {errors.name}
                  </FormHelperText>
                </FormControl>

                <FormControl isInvalid={!!errors.email}>
                  <InputGroup size="lg">
                    <InputLeftElement
                      pointerEvents="none"
                      children={<CFaEnvelope color="gray.400" />}
                    />
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      bg={inputBg}
                      borderRadius="md"
                      focusBorderColor="purple.500"
                      onChange={handleInputChange}
                    />
                  </InputGroup>
                  <FormHelperText color="red.500" fontSize="sm">
                    {errors.email}
                  </FormHelperText>
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <InputGroup size="lg">
                    <InputLeftElement
                      pointerEvents="none"
                      children={<CFaLock color="gray.400" />}
                    />
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      bg={inputBg}
                      borderRadius="md"
                      focusBorderColor="purple.500"
                      onChange={handleInputChange}
                    />
                    <InputRightElement width="4.5rem">
                      <Button
                        h="1.75rem"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormHelperText color="red.500" fontSize="sm">
                    {errors.password}
                  </FormHelperText>
                </FormControl>

                <FormControl isInvalid={!!errors.confirmpassword}>
                  <InputGroup size="lg">
                    <InputLeftElement
                      pointerEvents="none"
                      children={<CFaLock color="gray.400" />}
                    />
                    <Input
                      name="confirmpassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={formData.confirmpassword}
                      bg={inputBg}
                      borderRadius="md"
                      focusBorderColor="purple.500"
                      onChange={handleInputChange}
                    />
                  </InputGroup>
                  <FormHelperText color="red.500" fontSize="sm">
                    {errors.confirmpassword}
                  </FormHelperText>
                </FormControl>

                <Button
                  type="submit"
                  size="lg"
                  width="full"
                  mt={4}
                  bgGradient={bgGradient}
                  color="white"
                  _hover={{
                    bgGradient: "linear(to-r, purple.500, purple.700)",
                    boxShadow: "md",
                    transform: "translateY(-2px)",
                  }}
                  _active={{
                    transform: "translateY(0)",
                  }}
                  borderRadius="md"
                  fontWeight="semibold"
                  transition="all 0.2s"
                  isLoading={isSubmitting}
                  loadingText="Signing up..."
                >
                  Create Account
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>

        <HStack spacing={1} pt={2}>
          <Text color={mutedColor}>Already have an account?</Text>
          <Link 
            color="purple.500" 
            fontWeight="semibold"
            _hover={{ 
              textDecoration: "underline",
              color: "purple.600"
            }}
            onClick={() => handletabs(0)}
          >
            Sign In
          </Link>
        </HStack>
      </VStack>
    </Flex>
  );
};

export default Signup;