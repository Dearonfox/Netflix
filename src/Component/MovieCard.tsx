type Props = {
    title: string;
    posterPath: string | null;
    onClick?: () => void;
};

export default function MovieCard({ title, posterPath, onClick }: Props) {
    const img = posterPath
        ? `https://image.tmdb.org/t/p/w342${posterPath}`
        : "";

    return (
        <div
            onClick={onClick}
            style={{
                cursor: "pointer",
                transform: "scale(1)",
                transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget.style.transform = "scale(1.05)"))}
            onMouseLeave={(e) => ((e.currentTarget.style.transform = "scale(1)"))}
        >
            {img ? (
                <img
                    src={img}
                    alt={title}
                    style={{ width: "100%", borderRadius: 8, display: "block" }}
                />
            ) : (
                <div style={{ height: 210, background: "#333", borderRadius: 8 }} />
            )}
            <div style={{ color: "white", marginTop: 6, fontSize: 14 }}>{title}</div>
        </div>
    );
}