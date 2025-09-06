// components/MessageStatusIcon.jsx

const MessageStatusIcon = ({ status }) => {
  switch (status) {
    case 'sent':
      return <span title="Sent">✓</span>;
    case 'delivered':
      return <span title="Delivered">✓✓</span>;
    case 'seen':
      return (
        <span title="Seen" className="text-blue-300">
          ✓✓
        </span>
      );
    default:
      return null;
  }
};

export default MessageStatusIcon;
