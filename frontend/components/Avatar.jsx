import { imgUrl } from "@/lib/api";

export default function Avatar({ user, size = 36, className = "" }) {
  const style = { width: size, height: size, fontSize: size * 0.42 };
  if (user?.avatar) {
    return <img src={imgUrl(user.avatar)} alt="" style={style} className={`rounded-full object-cover shrink-0 ${className}`} />;
  }
  return (
    <span style={style} className={`grid place-items-center rounded-full bg-amber text-navy font-bold shrink-0 ${className}`}>
      {(user?.name?.[0] || "?").toUpperCase()}
    </span>
  );
}
