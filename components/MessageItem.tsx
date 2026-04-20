type Props = {
  text: string;
};

export default function MessageItem({ text }: Props) {
  return (
    <div className="text-white bg-zinc-800 p-3 rounded mb-2">
      {text}
    </div>
  );
}