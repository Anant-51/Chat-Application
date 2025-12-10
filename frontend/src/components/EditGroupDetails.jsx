import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useCentralStore from "../centralStore.jsx";
import { useNavigate } from "react-router-dom";
import editIcon from "../assets/edit-icon.png";
import ButtonComp from "./ButtonComp";
import ErrorDiv from "./ErrorDiv.jsx";
const url = import.meta.env.VITE_BACKEND_URL;

const EditGroupDetails = ({ setIsOpen }) => {
  const [chatDetails, setChatDetails] = useState({});
  const [visible, setVisible] = useState(false);
  const activeChatId = useCentralStore((state) => state.activeChatId);
  const fileRef = useRef(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      groupName: chatDetails?.groupName,
      groupDescription: chatDetails?.groupDescription,
    },
  });

  useEffect(() => {
    if (chatDetails) {
      reset({
        groupName: chatDetails.chatName || "",
        groupDescription: chatDetails.groupDescription || "",
      });
    }
  }, [chatDetails]);
  console.log("chatDetails", chatDetails);

  useEffect(() => {
    if (!activeChatId) return;
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${url}/api/chats/chatInfo?chatId=${activeChatId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const data = await res.json();
        console.log("data from chatInfo", data);
        if (data.isChat) {
          setChatDetails(data.chat);
        }
        if (!data.isChat) {
          setChatDetails(data.user);
        }
      } catch (err) {
        console.error("Error fetching chat info:", err);
      }
    };
    fetchData();
  }, [activeChatId, setChatDetails]);

  const file = watch("file");
  const chatImage = chatDetails.chatImage;

  const formData = new FormData();

  const handleClick = () => {
    fileRef.current.click();
  };
  const onSubmit = async (data) => {
    formData.append("file", data.file[0]);
    formData.append("chatId", activeChatId);
    formData.append("groupName", data.groupName);
    formData.append("groupDescription", data.groupDescription);
    const res = await fetch(`${url}/api/chats/editGroupDetails`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const result = await res.json();
    if (!res.ok) {
      setVisible(true);
    }
    if (res.ok) {
      setIsOpen(false);
    }
  };
  return (
    /* <div>
      {visible && (
        <ErrorDiv
          message="Something went wrong"
          visible={visible}
          setVisible={setVisible}
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center gap-5">
          <div className="flex gap-2">
            <div className="w-[50px] h-[50px] rounded-full bg-gray-300 overflow-hidden ">
              {file?.[0] ? (
                <img
                  src={URL.createObjectURL(file[0])}
                  alt=""
                  className="w-full h-full object-cover"
                ></img>
              ) : (
                <img
                  src={chatImage}
                  alt=""
                  className="w-full h-full object-cover"
                ></img>
              )}
            </div>
            <div
              className="w-[5px] h-[5px] rounded-full bg-gray-300 overflow-hidden"
              onclick={handleClick}
            >
              <img src={editIcon} className="w-full h-full object-cover" />
            </div>
          </div>
          <input
            accept="image/*"
            type="file"
            className="hidden"
            {...register("file", {
              validate: {
                lessThan2MB: (files) =>
                  files?.[0]?.size < 2 * 1024 * 1024 ||
                  "File size should be less than 2MB",
                acceptedFormats: (files) =>
                  ["image/png", "image/jpeg", "image/jpg"].includes(
                    files?.[0]?.type
                  ) || "Only png,jpg and jpeg formats are accepted",
              },
            })}
            ref={(e) => {
              fileRef.current = e;
              register("file").ref(e);
            }}
          />
          {errors.file && <p className="text-red-500">{errors.file.message}</p>}
          <div>
            <input
              type="text"
              {...register("groupName")}
              placeholder="Group Name"
              className="w-full h-10 px-2 outline-none border border-gray-300 rounded-md"
            ></input>
          </div>
          <div>
            <input
              type="text"
              {...register("groupDescription")}
              placeholder="Group Description"
              className="w-full h-10 px-2 outline-none border border-gray-300 rounded-md"
            ></input>
          </div>
        </div>
        <button type="submit" className="mt-[10px]">
          <ButtonComp text="Done" />
        </button>
      </form>
    </div> */
    <div className="w-full h-full flex justify-center mt-6 relative">
      <div className="w-full h-full max-w-md  shadow-sm p-6">
        {visible && (
          <ErrorDiv
            message="Something went wrong"
            visible={visible}
            setVisible={setVisible}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-center gap-6">
            {/* IMAGE + EDIT BUTTON */}
            <div className="relative">
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden  shadow">
                {file?.[0] ? (
                  <img
                    src={URL.createObjectURL(file[0])}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={chatImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Edit button */}
              <button
                type="button"
                onClick={handleClick}
                className="absolute bottom-0 right-0 bg-white shadow p-1 rounded-full border hover:bg-gray-100 transition"
              >
                <img src={editIcon} className="w-4 h-4" />
              </button>
            </div>

            {/* FILE INPUT */}
            <input
              accept="image/*"
              type="file"
              className="hidden"
              {...register("file", {
                validate: {
                  lessThan5MB: (files) => {
                    if (!files || files.length === 0) return true; // ✅ no file = valid
                    return (
                      files[0].size < 5 * 1024 * 1024 ||
                      "File size should be less than 5MB"
                    );
                  },
                  acceptedFormats: (files) => {
                    if (!files || files.length === 0) return true; // ✅ no file = valid
                    const accepted = ["image/jpeg", "image/png", "image/webp"];
                    return (
                      accepted.includes(files[0].type) ||
                      "This file format is not supported"
                    );
                  },
                },
              })}
              ref={(e) => {
                fileRef.current = e;
                register("file").ref(e);
              }}
            />
            {errors.file && (
              <p className="text-red-500 text-sm">{errors.file.message}</p>
            )}

            {/* INPUTS */}
            <div className="w-full">
              <label className="block mb-1 text-sm ml-1 font-medium text-gray-300">
                Group Name
              </label>
              <input
                type="text"
                {...register("groupName")}
                placeholder="Group Name"
                className="w-full h-10 px-4 outline-none border-2 text-black border-gray-500 rounded-md  focus:ring-blue-500 focus:border-blue-500 "
              />
            </div>

            <div className="w-full">
              <label className="block mb-1 text-sm font-medium text-gray-300 ml-1">
                Group Description
              </label>
              <input
                type="text"
                {...register("groupDescription")}
                placeholder="Group Description"
                className="w-full h-10 px-4 outline-none border-2 text-black border-gray-500  rounded-md focus:ring-blue-500 focus:border-blue-500 "
              />
            </div>
          </div>
          <div className="absolute bottom-8 right-4">
            {/*  <ButtonComp text="Done" type="submit" /> */}
            <button
              type="submit"
              className="bg-blue-500 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Done
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroupDetails;
