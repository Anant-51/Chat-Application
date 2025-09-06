// components/chat/MessageRenderer.jsx
import TextMessage from '../messageTypes/TextMessage';
import ImageMessage from '../messageTypes/ImageMessage';
import AudioMessage from '../messageTypes/AudioMessage';
import VideoMessage from '../messageTypes/VideoMessage';
import FileMessage from '../messageTypes/FileMessage';
import useCentralStore from '../centralStore';
const userId=useCentralStore((state)=>state.user.id);

const MessageRenderer = ({ message}) => {
 
  const isOwnMessage = message.senderId === userId;
  const status=message.seenStaus;
  const props = { message, isOwnMessage ,seenStatus};

  switch (message.messageType) {
    case 'text':
      return <TextMessage {...props} />;
    case 'image':
      return <ImageMessage {...props} />;
    case 'audio':
      return <AudioMessage {...props} />;
    case 'video':
      return <VideoMessage {...props} />;
    case 'file':
      return <FileMessage {...props} />;
    default:
      return <div className="text-red-500">Unsupported message type</div>;
  }
};

export default MessageRenderer;
