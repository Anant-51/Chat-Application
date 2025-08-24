const chatschema=new mongoose.Schema({
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }],
    latestMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message"
    },
    isGroupChat:{
        type:Boolean,
        default:false
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
