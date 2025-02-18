import { NavigateFunction } from "react-router-dom";

export interface CursoFromJson_old {
	Curso: string;
	Nome: string;
	Data: string;
	Unidade: string;
	Instrutor: string;
	Semestre: string;
	Imagens: Array<string>;
}

export interface CursoFromJson {
	Index: number;
	Curso: string;
	Data: string;
	Semestre: string;
	Instrutor: string;
	Noticia: string;
	NumeroParticipantes: number;
	Participantes: Array<Participante>;
	Imagens: Array<string>;
}

export interface ImagesFromJson {
	Curso: string;
	Imagens: Array<string>;
}

export interface Participante {
	Nome: string;
	Unidade: string;
}

export interface Curso {
	Titulo: string;
	Data: string;
	Instrutor: string;
	Semestre: string;
	Participantes: number;
	//Supostamente daria pra fazer uma união de
	//Array<React.ReactElement> | Array<Participante>
	//no ListaParticipantes, mas não consegui fazer isso.
	ListaParticipantes: Array<React.ReactElement>;
	ListaParticipantesDados: Array<Participante>;
	Imagens: Array<React.ReactElement>;
	ImagensPath: Array<string>;
	Noticia: string;
	Cor: string;
	Index: number;
	Imagem0: string;
	Folder: string;
}

export interface CursoArrayProps {
	Cursos: Array<Curso>;
}
export interface CursoProps {
	Curso: Curso;
}

export interface ModalRemoveImgProps {
	handleInnerModalOpen: () => void;
	length: number;
}

export interface ModalUploadImgProps {
	setFileList: (fl: FileList | null) => void;
	setHasFilesUploaded: (hf: boolean) => void;
	hasFilesUploaded: boolean;
	title: string;
	folder: string;
	fileList: FileList | null;
	navigate: NavigateFunction;
}

export interface RmvImgsModalProps {
	handleInnerModalClose: () => void;
	setSelectedThumbs: (thumbs: Array<string>) => void;
	activeInner: string;
	index: number;
	title: string;
	folder: string;
	ImagensPath: Array<string>;
	selectedThumbs: Array<string>;
	navigate: NavigateFunction;
}

export interface ParticipantsTableProps {
	ParticipantList: React.ReactElement<
		any,
		string | React.JSXElementConstructor<any>
	>[];
}

export interface NewsProps {
	URL: string;
}
