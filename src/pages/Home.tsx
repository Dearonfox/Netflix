import Banner from "../Component/Banner";
import MovieRow from "../Component/MovieRow";

export default function Home() {
    return (
        <div style={{ background: "#111", minHeight: "100vh" }}>
            <Banner />

            <div style={{ padding: "16px 22px" }}>
                <MovieRow title="인기 영화" kind="popular" />
                <MovieRow title="최신 영화" kind="now-playing" />
                <MovieRow title="평점 높은 영화" kind="top-rated" />
            </div>
        </div>
    );
}
