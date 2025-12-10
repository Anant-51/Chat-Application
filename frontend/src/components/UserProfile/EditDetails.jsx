import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useCentralStore from "../../centralStore.jsx";
import { useNavigate } from "react-router-dom";
import editIcon from "../../assets/edit-icon.png";
import ButtonComp from "../ButtonComp.jsx";
import ErrorDiv from "../ErrorDiv.jsx";
import { set } from "lodash";
const url = import.meta.env.VITE_BACKEND_URL;

const EditDetails = ({ setIsProfileOpen }) => {
  const [userDetails, setUserDetails] = useState({});
  const [visible, setVisible] = useState(false);
  const user = useCentralStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const userId = user._id;
  const fileRef = useRef(null);
  const navigate = useNavigate();
  const setUser = useCentralStore((state) => state.setUser);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?._id) {
        console.log("userDetails not found");
        return;
      }
      const usertDetails = await fetch(
        `${url}/api/user/userProfile?userId=${userId}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await usertDetails.json();
      setUserDetails(data.user);
    };
    fetchUserProfile();
  }, [userId]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      username: userDetails?.username,
      statusMessage: userDetails?.statusMessage,
    },
  });
  console.log("userDetails from edit details ", userDetails);
  const file = watch("file");

  useEffect(() => {
    if (userDetails) {
      reset({
        username: userDetails.username || "",
        statusMessage: userDetails.statusMessage || "",
      });
    }
  }, [userDetails]);
  const userProfile = userDetails?.profile;

  const formData = new FormData();

  const handleClick = () => {
    fileRef.current.click();
  };
  const onSubmit = async (data) => {
    setLoading(true);
    formData.append("file", data.file[0]);
    formData.append("userId", userId);
    formData.append("username", data.username);
    formData.append("statusMessage", data.statusMessage);
    const res = await fetch(`${url}/api/user/editUserDetails`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const result = await res.json();
    if (!res.ok) {
      setLoading(false);
      setVisible(true);
    }
    if (res.ok) {
      setLoading(false);
      setUser(result.user);
      setIsProfileOpen(false);
    }
  };
  return (
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
                    src={userProfile}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <button
                type="button"
                onClick={handleClick}
                className="absolute bottom-0 right-0 bg-white shadow p-1 rounded-full border hover:bg-gray-100 transition"
              >
                <img src={editIcon} className="w-4 h-4" />
              </button>
            </div>

            <input
              accept="image/*"
              type="file"
              className="hidden"
              {...register("file", {
                validate: {
                  lessThan5MB: (files) => {
                    if (!files || files.length === 0) return true;
                    return (
                      files[0].size < 5 * 1024 * 1024 ||
                      "File size should be less than 5MB"
                    );
                  },
                  acceptedFormats: (files) => {
                    if (!files || files.length === 0) return true;
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
                Username
              </label>
              <input
                type="text"
                {...register("username")}
                placeholder="username"
                className="w-full h-10 px-4 outline-none border-2 text-black border-gray-500 rounded-md  focus:ring-blue-500 focus:border-blue-500 "
              />
            </div>

            <div className="w-full">
              <label className="block mb-1 text-sm font-medium text-gray-300 ml-1">
                Status Message
              </label>
              <input
                type="text"
                {...register("statusMessage")}
                placeholder="status message"
                className="w-full h-10 px-4 outline-none border-2 text-black border-gray-500  rounded-md focus:ring-blue-500 focus:border-blue-500 "
              />
            </div>
          </div>
          <div className="absolute bottom-8 right-4">
            <button
              type="submit"
              disabled={loading}
              className={`text-white text-sm px-4 py-2 rounded-md transition
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }
  `}
            >
              {loading ? "Loading..." : "Done"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDetails;
