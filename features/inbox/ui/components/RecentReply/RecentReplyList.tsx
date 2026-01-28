// Temporary type definition until RecentReply is properly defined
interface RecentReply {
  email: string;
  name: string;
  company: string;
  type: 'positive' | 'negative';
  message: string;
  time: string;
}

const RecentRepliesList = ({
  recentReplies,
}: {
  recentReplies: RecentReply[];
}) => {
  if (!recentReplies || recentReplies.length === 0) {
    return (
      <div className="p-6 text-muted-foreground">No recent replies found.</div>
    );
  }
  return (
    <>
      {recentReplies.map((reply) => (
        <div
          key={reply.email}
          className="py-7 px-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {reply.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="font-medium text-foreground">{reply.name}</h3>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {reply.company}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${reply.type === "positive"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                >
                  {reply.type === "positive" ? "Interested" : "Not Interested"}
                </span>
              </div>
              <p className="text-muted-foreground mt-1">{reply.message}</p>
              <p className="text-sm text-muted-foreground mt-2">{reply.time}</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default RecentRepliesList;

