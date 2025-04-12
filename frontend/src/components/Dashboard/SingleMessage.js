import React, { useState } from "react";
import {
  Box,
  Image,
  Text,
  Button,
  Tooltip,
  Flex,
  Circle,
  Stack,
  useDisclosure,
  useColorModeValue,
  ScaleFade,
} from "@chakra-ui/react";
import { CopyIcon, DeleteIcon, CheckCircleIcon } from "@chakra-ui/icons";
import DeleteMessageModal from "../miscellaneous/DeleteMessageModal";

const SingleMessage = ({
  message,
  user,
  receiver,
  markdownToHtml,
  scrollbarconfig,
  socket,
  activeChatId,
  removeMessageFromList,
  toast,
}) => {
  const isSender = message.senderId === user._id;
  const messageTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const [isHovered, setIsHovered] = useState(false);

  const { isOpen: isDeleteModalOpen, onOpen: onOpenDeleteModal, onClose: onCloseDeleteModal } = useDisclosure();

  // Define all color mode values at the top
  const senderBg = useColorModeValue("purple.300", "purple.700");
  const receiverBg = useColorModeValue("blue.300", "blue.700");
  const senderReplyBg = useColorModeValue("purple.200", "purple.600");
  const receiverReplyBg = useColorModeValue("blue.200", "blue.600");
  const textColor = useColorModeValue("white", "gray.100");
  const subTextColor = useColorModeValue("#e6e5e5", "gray.300");
  const reactionBorderColor = useColorModeValue("gray.200", "gray.700");

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text).then(() => {
      toast({
        duration: 1000,
        render: () => (
          <Box color="white" p={2} bg="purple.500" borderRadius="md" boxShadow="md">
            Copied to clipboard!
          </Box>
        ),
      });
    });
  };

  const handleDeleteMessage = async (deletefrom) => {
    removeMessageFromList(message._id);
    onCloseDeleteModal();

    const deleteFrom = [user._id];
    if (deletefrom === 2) {
      deleteFrom.push(receiver._id);
    }

    const data = {
      messageId: message._id,
      ConversationId: activeChatId,
      deleteFrom,
    };

    socket.emit("delete-message", data);
  };

  return (
    <>
      <ScaleFade initialScale={0.95} in={true}>
        <Flex
          justify={isSender ? "end" : "start"}
          mx={{ base: 1, md: 2 }}
          my={1}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          align="flex-end"
          maxW="100%"
        >
          {!isSender && receiver?.profilePic && (
            <Image
              borderRadius="full"
              src={receiver.profilePic}
              alt="Sender"
              w={{ base: "24px", md: "30px" }}
              h={{ base: "24px", md: "30px" }}
              mr={2}
              flexShrink={0}
            />
          )}

          <Flex direction="column" maxW={{ base: "80%", md: "70%" }} position="relative">
            {isSender && isHovered && (
              <Flex
                align="center"
                position={{ base: "absolute", md: "relative" }}
                top={{ base: "-30px", md: "0" }}
                right={{ base: "0", md: "auto" }}
                mr={{ base: 0, md: 2 }}
                mb={{ base: 0, md: 1 }}
                order={{ base: 1, md: -1 }}
                zIndex={1}
              >
                <Tooltip label="Copy" placement="top">
                  <Button
                    size="xs"
                    variant="ghost"
                    color={textColor}
                    mr={1}
                    onClick={handleCopy}
                    borderRadius="full"
                    _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                  >
                    <CopyIcon />
                  </Button>
                </Tooltip>
                <Tooltip label="Delete" placement="top">
                  <Button
                    size="xs"
                    variant="ghost"
                    color={textColor}
                    onClick={onOpenDeleteModal}
                    borderRadius="full"
                    _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                  >
                    <DeleteIcon />
                  </Button>
                </Tooltip>
              </Flex>
            )}

            <Stack spacing={1} flex={1}>
              {message.replyto && (
                <Box
                  p={{ base: 1, md: 2 }}
                  borderRadius="lg"
                  bg={isSender ? senderReplyBg : receiverReplyBg}
                  color={textColor}
                  w="max-content"
                  maxW="100%"
                  fontSize="sm"
                  opacity={0.9}
                >
                  Reply to previous message
                </Box>
              )}

              <Box
                p={{ base: 2, md: 3 }}
                borderRadius="lg"
                bg={isSender ? senderBg : receiverBg}
                color={textColor}
                w="max-content"
                maxW="100%"
                boxShadow="sm"
                position="relative"
                transition="all 0.2s"
                _hover={{ boxShadow: "md" }}
              >
                {message.imageUrl && (
                  <Image
                    src={message.imageUrl}
                    alt="Attachment"
                    maxW={{ base: "150px", md: "200px" }}
                    borderRadius="md"
                    mb={2}
                    objectFit="cover"
                  />
                )}
                <Text
                  fontSize={{ base: "sm", md: "md" }}
                  overflowX="auto"
                  maxW="100%"
                  sx={scrollbarconfig}
                  dangerouslySetInnerHTML={markdownToHtml(message.text)}
                />
                <Flex justify="end" align="center" mt={1}>
                  <Text fontSize={{ base: "xs", md: "sm" }} color={subTextColor}>
                    {messageTime}
                  </Text>
                  {isSender && message.seenBy?.find((element) => element.user === receiver._id) && (
                    <CheckCircleIcon ml={1} color="green.200" boxSize={3} />
                  )}
                </Flex>

                {message.reaction && (
                  <Box
                    position="absolute"
                    bottom="-8px"
                    right="-8px"
                    bg={isSender ? senderBg : receiverBg}
                    borderRadius="full"
                    p={1}
                    fontSize="xs"
                    borderWidth="1px"
                    borderColor={reactionBorderColor}
                  >
                    {message.reaction}
                  </Box>
                )}
              </Box>

              {!isSender && isHovered && (
                <Flex
                  position={{ base: "absolute", md: "relative" }}
                  top={{ base: "-30px", md: "0" }}
                  left={{ base: "0", md: "auto" }}
                  ml={{ base: 0, md: 2 }}
                  mb={{ base: 0, md: 1 }}
                >
                  <Tooltip label="Copy" placement="top">
                    <Button
                      size="xs"
                      variant="ghost"
                      color={textColor}
                      onClick={handleCopy}
                      borderRadius="full"
                      _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                    >
                      <CopyIcon />
                    </Button>
                  </Tooltip>
                </Flex>
              )}
            </Stack>
          </Flex>
        </Flex>
      </ScaleFade>

      <DeleteMessageModal
        isOpen={isDeleteModalOpen}
        handleDeleteMessage={handleDeleteMessage}
        onClose={onCloseDeleteModal}
      />
    </>
  );
};

export default SingleMessage;