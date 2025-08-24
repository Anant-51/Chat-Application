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
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Chat",
        required:true
    },
    seenStatus:{
        type:Number,
        default:0
    },
    timestamps:true
});
const Message=mongoose.model("Message",messageschema);
export default Message;