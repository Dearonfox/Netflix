import Banner from "../Component/Banner";
import MovieRow from "../Component/MovieRow";

export default function Home() {
    return (
        <div style={{ background: "#111", minHeight: "100vh" }}>
            <Banner />

            <div style={{ padding: "16px 22px" }}>
                <MovieRow title="인기 영화" endpoint="/movie/popular" />
                <MovieRow title="최신 영화" endpoint="/movie/now_playing" />
                <MovieRow
                    title="액션 영화"
                    endpoint="/discover/movie"
                    params={{ with_genres: 28, sort_by: "popularity.desc" }}
                />
            </div>
        </div>
    );
}
