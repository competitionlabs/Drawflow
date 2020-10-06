const parameters = {
	classSelector: /^\.([\w-]+)$/, // class string expression check
	idSelector: /^#[\w\d\-\_\&\!\@\*]+$/, // ID string expression check
	tagSelector: /^[\w-]+$/ // TAG string expression check
};

export default parameters;