import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useDispatch } from "react-redux";
import { updateIssueStatus, deleteIssueAPI } from "../app/issueSlice";
import Card from "./ui/Card";
import { useState } from "react";
import IssueDetailModal from "./IssueDetailModal";

export default function IssueBoard({ projectId, issues }) {
  const dispatch = useDispatch();
  const [selectedIssue, setSelectedIssue] = useState(null);

  //set color for status
  const statusColors = {
    todo: "border-blue-400",
    inprogress: "border-yellow-400",
    done: "border-green-400",
  };

  const statuses = ["todo", "inprogress", "done"];
  const statusTitles = {
    todo: "To Do",
    inprogress: "In Progress",
    done: "Done",
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId !== source.droppableId) {
      dispatch(
        updateIssueStatus({
          taskId: draggableId,
          statusId: destination.droppableId, // statusId tương ứng với API thực
        })
      );
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statuses.map((status) => (
          <Droppable key={status} droppableId={status}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-gray-50 border rounded-xl p-3 min-h-[400px]"
              >
                <h3 className="font-semibold mb-3">{statusTitles[status]}</h3>
                {issues
                  .filter((i) => i.statusName?.toLowerCase() === status)
                  .map((issue, index) => (
                    <Draggable
                      key={issue.taskId}
                      draggableId={issue.taskId.toString()}
                      index={index}
                    >
                      {(prov) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className="mb-3"
                        >
                          <Card
                            className={`p-3 border-l-4 ${statusColors[status]} cursor-pointer`}
                            onClick={() => setSelectedIssue(issue)}
                          >
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium text-gray-800">
                                  {issue.taskName}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {issue.description}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dispatch(deleteIssueAPI(issue.taskId));
                                }}
                                className="text-red-500 hover:text-red-700 font-semibold"
                              >
                                ✕
                              </button>
                            </div>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </DragDropContext>
  );
}
