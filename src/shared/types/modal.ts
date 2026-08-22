export type ModalOpenOptions = {
	ariaLabel: string;
	closeOnBackdrop?: boolean;
	closeOnEsc?: boolean;
	paddingSize?: number;
	returnFocusFallback?: () => HTMLElement | null;
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
			options: null;
	  };

export type ModalContextValue = {
	isOpen: boolean;
	openModal: (content: React.ReactNode, options: ModalOpenOptions) => void;
	closeModal: () => void;
};
