const messageschema=new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
 
    content:{
        type:String,
        required:true
    },
    fileurl:{
        type:String
    },
    fileType:{
        type:String
    },
    mediaSize:{
        type:Number
    },
    pageCount:{
        type:Number
    },
    messageType:{
        type:String,
        required:true,
        default:'text'
    },
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Chat",
        required:true
    },
    recievedBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    readBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],

    seenStatus:{
        type:Number,
        default:0
    },
    timestamps:true
});
const Message=mongoose.model("Message",messageschema);
export default Message;