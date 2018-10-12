/**
 * STATES:
 * 0: Resource Created
 * 1: Loading
 * 2: Loaded - Evaluating
 * 2.5: Paused - Evaluating paused
 * 3: Evaluated - Childs Loading
 * 4: Childs Loaded - Completed
 */

export enum State {
	Unknown = -1,
	Created = 0,
	Loading = 1,
	Evaluating = 2,
	Paused = 2.5,
	Evaluated = 3,
	AllCompleted = 4
}