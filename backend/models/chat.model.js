const chatschema=new mongoose.Schema({
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }],
    unreadCountPerUser:{
        type:Object
    },
    latestMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message"
    },
    isGroupChat:{
        type:Boolean,
        default:false
    },
    chatImage:{
        type:String,
        default:`http://localhost:${process.env.PORT}/static/groupImage.png`
    },
    chatName:{
        type:String
    },
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    chatname:{
        type:String
    },groupprofile:{
        type:String,
    }
},{
    timestamps:true

})
const Chat=mongoose.model("Chat",chatschema);
export default Chat;
