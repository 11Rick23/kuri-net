export type ModalOpenOptions = {
	closeOnBackdrop?: boolean;
	closeOnEsc?: boolean;
	paddingSize?: number;
};

export type ModalState =
	| {
			isOpen: true;
			content: React.ReactNode;
			options: Required<ModalOpenOptions>;
	  }
	| {
			isOpen: false;
			content: null;
			options: Required<ModalOpenOptions>;
	  };

export type ModalContextValue = {
	isOpen: boolean;
	openModal: (content: React.ReactNode, options?: ModalOpenOptions) => void;
	closeModal: () => void;
};
