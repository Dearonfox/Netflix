import MovieRow from "../Component/MovieRow";

export default function Popular() {
    return (
        <div style={{ background: "#111", minHeight: "100vh", padding: "16px 22px" }}>
            <MovieRow title="인기 영화" endpoint="/movie/popular" />
            <MovieRow title="평점 높은 영화" endpoint="/movie/top_rated" />
            <MovieRow title="상영 예정" endpoint="/movie/upcoming" />
        </div>
    );
}
