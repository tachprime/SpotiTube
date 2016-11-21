function rankReducer(all, current) {
	return (all.indexOf(current) == -1) ? rankReducer(all, current - 1) : (all.indexOf(current), current);
}