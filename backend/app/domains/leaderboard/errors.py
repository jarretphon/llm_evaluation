class NoLeaderboardBenchmarksSelectedError(Exception):
    def __str__(self) -> str:
        return "Select at least one benchmark for the leaderboard."


class InvalidLeaderboardBenchmarkError(Exception):
    def __init__(self, benchmarks: list[str]) -> None:
        self.benchmarks = benchmarks

    def __str__(self) -> str:
        invalid_benchmarks = ", ".join(self.benchmarks)
        return f"Invalid leaderboard benchmark selection: {invalid_benchmarks}"
