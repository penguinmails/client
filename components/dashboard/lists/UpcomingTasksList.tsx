import React from "react";
import { Calendar, Mail, FileText, Globe } from "lucide-react";
import { standaloneIconColors, textColors, typography, spacing } from "@/shared/lib/design-tokens";
import { cn } from "@/shared/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";

// Define the expected data structure for props
interface Task {
  id: number;
  title: string;
  type: "campaign" | "email" | "template" | "domain";
  dueDate: string;
}

interface UpcomingTasksListProps {
  tasks: Task[];
}

// Helper function to get the appropriate icon for each task type
const getTaskIcon = (type: string) => {
  switch (type) {
    case "campaign":
      return <Calendar size={16} className={standaloneIconColors.blue} />;
    case "email":
      return <Mail size={16} className={standaloneIconColors.green} />;
    case "template":
      return <FileText size={16} className={standaloneIconColors.purple} />;
    case "domain":
      return <Globe size={16} className={standaloneIconColors.orange} />;
    default:
      return <Calendar size={16} className={standaloneIconColors.gray} />;
  }
};

const UpcomingTasksList: React.FC<UpcomingTasksListProps> = ({ tasks }) => {
  return (
    <Card className="h-64 flex flex-col">
      <CardHeader>
        <CardTitle className={typography.cardTitle}>
          Upcoming Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        {/* Use the tasks prop */}
        <ul className={spacing.componentGap}>
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                {getTaskIcon(task.type)}
              </div>
              <div className="ml-3">
                <p className={cn("text-sm font-medium", textColors.primary)}>
                  {task.title}
                </p>
                <p className={cn("text-xs", textColors.secondary)}>
                  {task.type.charAt(0).toUpperCase() + task.type.slice(1)} ·{" "}
                  {task.dueDate}
                </p>
              </div>
            </li>
          ))}
          {/* Add a message if no tasks */}
          {tasks.length === 0 && (
            <li className={cn("py-3 text-sm text-center", textColors.secondary)}>
              No upcoming tasks found.
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default UpcomingTasksList;
