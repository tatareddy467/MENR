import clsx from "clsx";
import moment from "moment";
import React, { useState } from "react";
import {
  FaBug,
  FaFile,
  FaSpinner,
  FaTasks,
  FaThumbsUp,
  FaUser,
} from "react-icons/fa";
import { GrInProgress } from "react-icons/gr";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineDoneAll,
  MdOutlineMessage,
  MdTaskAlt,
} from "react-icons/md";
import { RxActivityLog } from "react-icons/rx";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button, Loading, Tabs } from "../components";
import { TaskColor } from "../components/tasks";
import {
  useChangeSubTaskStatusMutation,
  useGetSingleTaskQuery,
  usePostTaskActivityMutation,
} from "../redux/slices/api/taskApiSlice";
import {
  PRIOTITYSTYELS,
  TASK_TYPE,
  getCompletedSubTasks,
  getInitials,
} from "../utils";

import FileImage from "../assets/file.png";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const bgColor = {
  high: "bg-red-200",
  medium: "bg-yellow-200",
  low: "bg-blue-200",
};

const TABS = [
  { title: "Task Detail", icon: <FaTasks /> },
  { title: "Activities/Timeline", icon: <RxActivityLog /> },
];

const TASKTYPEICON = {
  commented: (
    <div className="flex items-center justify-center w-10 h-10 text-white bg-gray-500 rounded-full">
      <MdOutlineMessage />,
    </div>
  ),
  started: (
    <div className="flex items-center justify-center w-10 h-10 text-white bg-blue-600 rounded-full">
      <FaThumbsUp size={20} />
    </div>
  ),
  assigned: (
    <div className="flex items-center justify-center w-6 h-6 text-white bg-gray-500 rounded-full">
      <FaUser size={14} />
    </div>
  ),
  bug: (
    <div className="text-red-600">
      <FaBug size={24} />
    </div>
  ),
  completed: (
    <div className="flex items-center justify-center w-10 h-10 text-white bg-green-600 rounded-full">
      <MdOutlineDoneAll size={24} />
    </div>
  ),
  "in progress": (
    <div className="flex items-center justify-center w-8 h-8 text-white rounded-full bg-violet-600">
      <GrInProgress size={16} />
    </div>
  ),
};

const act_types = [
  "Started",
  "Completed",
  "In Progress",
  "Commented",
  "Bug",
  "Assigned",
];

const Activities = ({ activity, id, refetch }) => {
  const [selected, setSelected] = useState("Started");
  const [text, setText] = useState("");

  const [postActivity, { isLoading }] = usePostTaskActivityMutation();

  const handleSubmit = async () => {
    try {
      const data = {
        type: selected?.toLowerCase(),
        activity: text,
      };
      const res = await postActivity({
        data,
        id,
      }).unwrap();
      setText("");
      toast.success(res?.message);
      refetch();
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const Card = ({ item }) => {
    return (
      <div className={`flex space-x-4`}>
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="flex items-center justify-center w-10 h-10">
            {TASKTYPEICON[item?.type]}
          </div>
          <div className="flex items-center h-full">
            <div className="w-0.5 bg-gray-300 h-full"></div>
          </div>
        </div>

        <div className="flex flex-col mb-8 gap-y-1">
          <p className="font-semibold">{item?.by?.name}</p>
          <div className="space-x-2 text-gray-500">
            <span className="capitalize">{item?.type}</span>
            <span className="text-sm">{moment(item?.date).fromNow()}</span>
          </div>
          <div className="text-gray-700">{item?.activity}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-between w-full min-h-screen gap-10 px-10 py-8 overflow-y-auto bg-white rounded-md shadow 2xl:gap-20">
      <div className="w-full md:w-1/2">
        <h4 className="mb-5 text-lg font-semibold text-gray-600">Activities</h4>
        <div className="w-full space-y-0">
          {activity?.map((item, index) => (
            <Card
              key={item.id}
              item={item}
              isConnected={index < activity?.length - 1}
            />
          ))}
        </div>
      </div>

      <div className="w-full md:w-1/3">
        <h4 className="mb-5 text-lg font-semibold text-gray-600">
          Add Activity
        </h4>
        <div className="flex flex-wrap w-full gap-5">
          {act_types.map((item, index) => (
            <div key={item} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={selected === item ? true : false}
                onChange={(e) => setSelected(item)}
              />
              <p>{item}</p>
            </div>
          ))}
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type ......"
            className="w-full p-4 mt-10 bg-white border border-gray-300 rounded-md outline-none focus:ring-2 ring-blue-500"
          ></textarea>
          {isLoading ? (
            <Loading />
          ) : (
            <Button
              type="button"
              label="Submit"
              onClick={handleSubmit}
              className="text-white bg-blue-600 rounded"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const TaskDetail = () => {
  const { id } = useParams();
  const { data, isLoading, refetch } = useGetSingleTaskQuery(id);
  const [subTaskAction, { isLoading: isSubmitting }] =
    useChangeSubTaskStatusMutation();

  const [selected, setSelected] = useState(0);
  const task = data?.task || [];

  const handleSubmitAction = async (el) => {
    try {
      const data = {
        id: el.id,
        subId: el.subId,
        status: !el.status,
      };
      const res = await subTaskAction({
        ...data,
      }).unwrap();

      toast.success(res?.message);
      refetch();
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  if (isLoading)
    <div className="py-10">
      <Loading />
    </div>;

  const percentageCompleted =
    task?.subTasks?.length === 0
      ? 0
      : (getCompletedSubTasks(task?.subTasks) / task?.subTasks?.length) * 100;

  return (
    <div className="flex flex-col w-full gap-3 mb-4 overflow-y-hidden">
      {/* task detail */}
      <h1 className="text-2xl font-bold text-gray-600">{task?.title}</h1>
      <Tabs tabs={TABS} setSelected={setSelected}>
        {selected === 0 ? (
          <>
            <div className="flex flex-col w-full gap-5 px-8 py-8 overflow-y-auto bg-white rounded-md shadow md:flex-row 2xl:gap-8">
              <div className="w-full space-y-8 md:w-1/2">
                <div className="flex items-center gap-5">
                  <div
                    className={clsx(
                      "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full",
                      PRIOTITYSTYELS[task?.priority],
                      bgColor[task?.priority]
                    )}
                  >
                    <span className="text-lg">{ICONS[task?.priority]}</span>
                    <span className="uppercase">{task?.priority} Priority</span>
                  </div>

                  <div className={clsx("flex items-center gap-2")}>
                    <TaskColor className={TASK_TYPE[task?.stage]} />
                    <span className="text-black uppercase">{task?.stage}</span>
                  </div>
                </div>

                <p className="text-gray-500">
                  Created At: {new Date(task?.date).toDateString()}
                </p>

                <div className="flex items-center gap-8 p-4 border-gray-200 border-y">
                  <div className="space-x-2">
                    <span className="font-semibold">Assets :</span>
                    <span>{task?.assets?.length}</span>
                  </div>
                  <span className="text-gray-400">|</span>
                  <div className="space-x-2">
                    <span className="font-semibold">Sub-Task :</span>
                    <span>{task?.subTasks?.length}</span>
                  </div>
                </div>

                <div className="py-6 space-y-4">
                  <p className="text-sm font-semibold text-gray-500">
                    TASK TEAM
                  </p>
                  <div className="space-y-3">
                    {task?.team?.map((m, index) => (
                      <div
                        key={index + m?._id}
                        className="flex items-center gap-4 py-2 border-t border-gray-200"
                      >
                        <div
                          className={
                            "w-10 h-10 rounded-full text-white flex items-center justify-center text-sm -mr-1 bg-blue-600"
                          }
                        >
                          <span className="text-center">
                            {getInitials(m?.name)}
                          </span>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{m?.name}</p>
                          <span className="text-gray-500">{m?.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {task?.subTasks?.length > 0 && (
                  <div className="py-6 space-y-4">
                    <div className="flex items-center gap-5">
                      <p className="text-sm font-semibold text-gray-500">
                        SUB-TASKS
                      </p>
                      <div
                        className={`w-fit h-8 px-2 rounded-full flex items-center justify-center text-white ${
                          percentageCompleted < 50
                            ? "bg-rose-600"
                            : percentageCompleted < 80
                            ? "bg-amber-600"
                            : "bg-emerald-600"
                        }`}
                      >
                        <p>{percentageCompleted.toFixed(2)}%</p>
                      </div>
                    </div>
                    <div className="space-y-8">
                      {task?.subTasks?.map((el, index) => (
                        <div key={index + el?._id} className="flex gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-200">
                            <MdTaskAlt className="text-violet-600" size={26} />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {new Date(el?.date).toDateString()}
                              </span>

                              <span className="px-2 py-0.5 text-center text-sm rounded-full bg-violet-100 text-violet-700 font-semibold lowercase">
                                {el?.tag}
                              </span>

                              <span
                                className={`px-2 py-0.5 text-center text-sm rounded-full font-semibold ${
                                  el?.isCompleted
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-50 text-amber-600"
                                }`}
                              >
                                {el?.isCompleted ? "done" : "in progress"}
                              </span>
                            </div>
                            <p className="pb-2 text-gray-700">{el?.title}</p>

                            <>
                              <button
                                disabled={isSubmitting}
                                className={`text-sm outline-none bg-gray-100 text-gray-800 p-1 rounded ${
                                  el?.isCompleted
                                    ? "hover:bg-rose-100 hover:text-rose-800"
                                    : "hover:bg-emerald-100 hover:text-emerald-800"
                                } disabled:cursor-not-allowed`}
                                onClick={() =>
                                  handleSubmitAction({
                                    status: el?.isCompleted,
                                    id: task?._id,
                                    subId: el?._id,
                                  })
                                }
                              >
                                {isSubmitting ? (
                                  <FaSpinner className="animate-spin" />
                                ) : el?.isCompleted ? (
                                  " Mark as Undone"
                                ) : (
                                  " Mark as Done"
                                )}
                              </button>
                            </>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full space-y-3 md:w-1/2">
                {task?.description && (
                  <div className="mb-10">
                    <p className="text-lg font-semibold">TASK DESCRIPTION</p>
                    <div className="w-full">{task?.description}</div>
                  </div>
                )}

                {task?.assets?.length > 0 && (
                  <div className="pb-10">
                    <p className="text-lg font-semibold">ASSETS</p>
                    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                      {task?.assets?.map((el, index) => (
                        <a href={el} target="_blank" key={index}>
                          {el.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                              src={el}
                              alt={index}
                              className="w-full h-auto transition-all duration-700 rounded cursor-pointer md:h-44 2xl:h-52 md:hover:scale-125 hover:z-50"
                            />
                          ) : (
                            <img
                              src={FileImage}
                              alt={index}
                              className="w-auto h-auto transition-all duration-700 rounded cursor-pointer md:h-44 2xl:h-52 md:hover:scale-125 hover:z-50"
                            />
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* {el.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img
                            key={index}
                            src={el}
                            alt={index}
                            className="w-full h-auto transition-all duration-700 rounded cursor-pointer md:h-44 2xl:h-52 md:hover:scale-125 hover:z-50"
                          />
                        ) : (
                          <div 
                            key={index}
                            className="flex items-center justify-center w-full bg-gray-100 rounded cursor-pointer h-44 2xl:h-52"
                          >
                            <FaFile size={48} className="text-gray-400" />
                          </div>
                        )} */}
                {task?.links?.length > 0 && (
                  <div className="">
                    <p className="text-lg font-semibold">SUPPORT LINKS</p>
                    <div className="flex flex-col w-full gap-4">
                      {task?.links?.map((el, index) => (
                        <a
                          key={index}
                          href={el}
                          target="_blank"
                          className="text-blue-600 hover:underline"
                        >
                          {el}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <Activities activity={task?.activities} refetch={refetch} id={id} />
          </>
        )}
      </Tabs>
    </div>
  );
};

export default TaskDetail;
