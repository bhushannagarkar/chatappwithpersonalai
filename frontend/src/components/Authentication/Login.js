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
  Tooltip,
  Text,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
  Icon,
  Image,
} from "@chakra-ui/react";
import { FaLock, FaEnvelope, FaKey } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import chatContext from "../../context/chatContext";
import { ArrowBackIcon } from "@chakra-ui/icons";

const CFaLock = chakra(FaLock);
const CFaEnvelope = chakra(FaEnvelope);

const Login = (props) => {
  const context = useContext(chatContext);
  const { hostName, socket, setUser, setIsAuthenticated, fetchData } = context;
  const toast = useToast();
  const navigator = useNavigate();

  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const handletabs = props.handleTabsChange;
  const [showPassword, setShowPassword] = useState(false);
  const [forgotpasswordshow, setforgotpasswordshow] = useState(false);
  const [sending, setsending] = useState(false);

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const mutedColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgGradient = "linear(to-r, purple.400, purple.600)";
  const hoverBg = useColorModeValue("purple.50", "rgba(128, 90, 213, 0.12)");

  const handleShowClick = () => setShowPassword(!showPassword);

  const showtoast = (title, description, status) => {
    toast({
      title: title,
      description: description,
      status: status,
      duration: 5000,
      isClosable: true,
      position: "top",
      variant: "solid",
    });
  };

  const handleLogin = async function (e) {
    e.preventDefault();

    if (!email) {
      showtoast("Email required", "Please enter your email address", "warning");
      return;
    }

    if (!forgotpasswordshow && !password) {
      showtoast("Password required", "Please enter your password", "warning");
      return;
    }

    const data = {
      email: email,
    };

    //check if the user is trying to login using otp
    const otp = document.getElementById("otp")?.value;

    if (otp?.length > 0 && forgotpasswordshow) {
      data.otp = otp;
    } else {
      data.password = password;
    }

    try {
      const response = await fetch(`${hostName}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resdata = await response.json();

      if (response.status !== 200) {
        showtoast("An error occurred", resdata.error, "error");
      } else {
        showtoast("Login successful", "Welcome back to Health Assistant!", "success");

        localStorage.setItem("token", resdata.authtoken);
        setUser(await resdata.user);
        socket.emit("setup", await resdata.user._id);
        setIsAuthenticated(true);
        fetchData();
        navigator("/dashboard");
      }
    } catch (error) {
      console.log(error);
      showtoast("Connection error", "Please check your internet connection", "error");
    }
  };

  const handlesendotp = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showtoast("Email required", "Please enter your email address", "warning");
      return;
    }
    
    setsending(true);

    const data = {
      email: email,
    };

    try {
      const response = await fetch(`${hostName}/auth/getotp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resdata = await response.json();

      setsending(false);

      if (response.status !== 200) {
        showtoast("An error occurred", resdata.error, "error");
      } else {
        showtoast("OTP Sent", "Check your email for the verification code", "success");
      }
    } catch (error) {
      console.log(error);
      setsending(false);
      showtoast("Connection error", "Please check your internet connection", "error");
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
          icon={<Icon as={FaKey} color="white" w={8} h={8} />}
          shadow="lg"
        />
        
        <Heading 
          fontSize={{ base: "2xl", md: "3xl" }} 
          fontWeight="bold" 
          color={textColor}
          textAlign="center"
        >
          {forgotpasswordshow ? "Reset Password" : "Welcome Back"}
        </Heading>
        
        <Text color={mutedColor} textAlign="center" pb={2} fontSize="md">
          {forgotpasswordshow 
            ? "Enter your email and we'll send you a verification code" 
            : "Sign in to continue to your account"}
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
            <form onSubmit={handleLogin}>
              <VStack spacing={5}>
                {forgotpasswordshow && (
                  <Tooltip label="Back to login" placement="top">
                    <Button
                      leftIcon={<ArrowBackIcon />}
                      variant="ghost"
                      colorScheme="purple"
                      alignSelf="flex-start"
                      size="sm"
                      onClick={() => setforgotpasswordshow(false)}
                      mb={2}
                    >
                      Back to login
                    </Button>
                  </Tooltip>
                )}

                <FormControl>
                  <InputGroup size="lg">
                    <InputLeftElement
                      pointerEvents="none"
                      children={<CFaEnvelope color="gray.400" />}
                    />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Email address"
                      value={email}
                      bg={inputBg}
                      borderRadius="md"
                      focusBorderColor="purple.500"
                      onChange={(e) => setemail(e.target.value)}
                    />
                    {forgotpasswordshow && (
                      <InputRightElement width="4.5rem">
                        <Button
                          h="1.75rem"
                          size="sm"
                          colorScheme="purple"
                          isLoading={sending}
                          loadingText="Sending"
                          onClick={handlesendotp}
                        >
                          {sending ? <Spinner size="sm" /> : "Send OTP"}
                        </Button>
                      </InputRightElement>
                    )}
                  </InputGroup>
                </FormControl>

                {!forgotpasswordshow ? (
                  <FormControl>
                    <InputGroup size="lg">
                      <InputLeftElement
                        pointerEvents="none"
                        children={<CFaLock color="gray.400" />}
                      />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        bg={inputBg}
                        borderRadius="md"
                        focusBorderColor="purple.500"
                        onChange={(e) => setpassword(e.target.value)}
                      />
                      <InputRightElement width="4.5rem">
                        <Button
                          h="1.75rem"
                          size="sm"
                          onClick={handleShowClick}
                          variant="ghost"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormHelperText textAlign="right">
                      <Link 
                        color="purple.500" 
                        _hover={{ textDecoration: "underline" }}
                        onClick={() => setforgotpasswordshow(true)}
                      >
                        Forgot password?
                      </Link>
                    </FormHelperText>
                  </FormControl>
                ) : (
                  <FormControl>
                    <InputGroup size="lg">
                      <InputLeftElement
                        pointerEvents="none"
                        children={<CFaLock color="gray.400" />}
                      />
                      <Input
                        id="otp"
                        type="number"
                        placeholder="Enter OTP code"
                        bg={inputBg}
                        borderRadius="md"
                        focusBorderColor="purple.500"
                      />
                    </InputGroup>
                    <FormHelperText>
                      Check your email for the verification code
                    </FormHelperText>
                  </FormControl>
                )}

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
                >
                  {forgotpasswordshow ? "Reset Password" : "Sign In"}
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>

        <HStack spacing={1} pt={2}>
          <Text color={mutedColor}>New to Health Assistant?</Text>
          <Link 
            color="purple.500" 
            fontWeight="semibold"
            _hover={{ 
              textDecoration: "underline",
              color: "purple.600"
            }}
            onClick={() => handletabs(1)}
          >
            Create an Account
          </Link>
        </HStack>
      </VStack>
    </Flex>
  );
};

export default Login;