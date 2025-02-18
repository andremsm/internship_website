import { useState, useEffect } from "react";
import { TweenMax, Power4 } from "gsap";
import Slider from "react-slick";
import { CursoArrayProps } from "./Interface";
import { browserName } from "react-device-detect";
import "./LoginModal.css";
import "./glyphs/style.css";
import { News } from "./News";
import { ParticipantsTable } from "./ParticipantsTable";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UploadImagesButton } from "./UploadImagesButton";
import { RemoveImagesModal } from "./RemoveImagesModal";
import { getCurrentUser } from "./Utils";

export function SimpleSlider(props: CursoArrayProps) {
	//Provavelmente isso aqui poderia ter sido melhor feito, mas como seriam
	//sempre 5 imagens no slider, foi mais fácil fazer assim.

	const [isModal, setModal] = useState([false, false, false, false, false]);

	const [isInnerModal, setInnerModal] = useState([
		false,
		false,
		false,
		false,
		false,
	]);
	const [isOuterModal, setOuterModal] = useState([
		false,
		false,
		false,
		false,
		false,
	]);

	const [fileList, setFileList] = useState<FileList | null>(null);
	const [hasFilesUploaded, setHasFilesUploaded] = useState(false);
	const [selectedThumbs, setSelectedThumbs] = useState<Array<string>>([]);

	const [queryParams] = useSearchParams();
	const navigate = useNavigate();

	//Ao clicar no box, definir o modal como ativo.
	//Ao clicar no 'x', ou fora do modal definir o modal como inativo.
	//O hook "Modal" tem um comentário na parte em que um clique fora
	//do modal o define como inativo, caso não esteja claro.

	//Ao clicar no box, definir o modal como ativo.
	const handleModalOpen = (m: number) => {
		window.history.pushState(
			"fake-route",
			document.title,
			`?course=${props.Cursos[m].Titulo}`
		);
		const modalCopy = Array(5).fill(false);
		modalCopy[m] = true;
		setModal(modalCopy);
	};

	//Ao clicar no 'x', ou fora do modal definir o modal como inativo.
	const handleModalClose = (m: number) => {
		window.history.back();
		const modalCopy = Array(5).fill(false);
		modalCopy[m] = false;
		setModal(modalCopy);
	};

	const handleOuterModalOpen = (i: number) => {
		window.history.pushState(
			"fake-route",
			document.title,
			`?course=${props.Cursos[i].Titulo}`
		);
		const modalCopy = Array(5).fill(false);
		modalCopy[i] = true;
		setOuterModal(modalCopy);
		//console.log("outer modal open");
	};

	const handleInnerModalOpen = (i: number) => {
		window.history.pushState(
			"fake-route",
			document.title,
			`?course=${props.Cursos[i].Titulo}`
		);
		const modalCopy = Array(5).fill(false);
		modalCopy[i] = true;
		setInnerModal(modalCopy);
		//console.log("inner modal open");
		//console.log(isInnerModal);
	};

	const handleOuterModalClose = () => {
		window.history.back();
	};

	const handleInnerModalClose = () => {
		window.history.back();
		//setSelectedThumbs([]);
	};

	const active = [
		isModal[0] ? "is-active" : "",
		isModal[1] ? "is-active" : "",
		isModal[2] ? "is-active" : "",
		isModal[3] ? "is-active" : "",
		isModal[4] ? "is-active" : "",
	];

	const activeInner = [
		isInnerModal[0] ? "is-active" : "",
		isInnerModal[1] ? "is-active" : "",
		isInnerModal[2] ? "is-active" : "",
		isInnerModal[3] ? "is-active" : "",
		isInnerModal[4] ? "is-active" : "",
	];

	const activeOuter = [
		isOuterModal[0] ? "is-active" : "",
		isOuterModal[1] ? "is-active" : "",
		isOuterModal[2] ? "is-active" : "",
		isOuterModal[3] ? "is-active" : "",
		isOuterModal[4] ? "is-active" : "",
	];

	function closeModal() {
		const modalFalse = Array(5).fill(false);
		setModal(modalFalse);
	}

	//Permite fechar o modal pressionando "Voltar" no navegador.
	useEffect(() => {
		//Mobile only.
		if (true) {
			// Add a fake history event so that the back button does nothing if pressed once
			const handleBack = () => {
				//console.log("back");
				if (isInnerModal.includes(true) && isOuterModal.includes(true))
					setInnerModal([false, false, false, false, false]);
				else if (
					!isInnerModal.includes(true) &&
					isOuterModal.includes(true)
				)
					setOuterModal([false, false, false, false, false]);
			};

			window.addEventListener("popstate", handleBack);

			// Here is the cleanup when this component unmounts
			return () => {
				window.removeEventListener("popstate", handleBack);
				// If we left without using the back button, aka by using a button on the page, we need to clear out that fake history event
				if (window.history.state === "fake-route") {
					//window.history.back();
				}
			};
		} else return () => {};
	}, [isInnerModal, isOuterModal]);

	useEffect(() => {
		let modalCard: Element | null = null;
		let modalBackground: Element | null = null;
		const y = () => {
			if (browserName === "Chrome") return 0;
			else return 128;
		};
		if (isModal[0]) {
			modalCard = document.querySelector("#modalCardSlider0");
			modalBackground = document.querySelector("#modalBackgroundSlider0");
		} else if (isModal[1]) {
			modalCard = document.querySelector("#modalCardSlider1");
			modalBackground = document.querySelector("#modalBackgroundSlider1");
		} else if (isModal[2]) {
			modalCard = document.querySelector("#modalCardSlider2");
			modalBackground = document.querySelector("#modalBackgroundSlider2");
		} else if (isModal[3]) {
			modalCard = document.querySelector("#modalCardSlider3");
			modalBackground = document.querySelector("#modalBackgroundSlider3");
		} else if (isModal[4]) {
			modalCard = document.querySelector("#modalCardSlider4");
			modalBackground = document.querySelector("#modalBackgroundSlider4");
		}
		if (modalCard !== null && modalBackground !== null) {
			TweenMax.set(modalCard, { y: y, opacity: 0 });
			TweenMax.set(modalBackground, { opacity: 0 });
			TweenMax.fromTo(
				modalCard,
				0.65,
				{ y: y },
				{ y: 0, opacity: 1, ease: Power4.easeOut }
			);
			TweenMax.fromTo(
				modalBackground,
				0.45,
				{},
				{ opacity: 1, ease: Power4.easeOut }
			);
		}
	}, [isModal]);

	//Permite fechar o modal apertando ESC.
	useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				if (isInnerModal.includes(true))
					setInnerModal([false, false, false, false, false]);
				else if (isOuterModal.includes(true))
					setOuterModal([false, false, false, false, false]);
				//const modalFalse = Array(5).fill(false);
				window.history.back();
				//setModal(modalFalse);
			}
		};
		window.addEventListener("keydown", handleEsc);

		return () => {
			window.removeEventListener("keydown", handleEsc);
		};
	}, [isInnerModal, isOuterModal]);

	const removeImagesButton = (i: number) => {
		if (getCurrentUser() && props.Cursos[i].ImagensPath.length > 0)
			return (
				<div className="buttons is-centered">
					<button
						className="button is-info"
						style={{
							whiteSpace: "pre-line",
						}}
						onClick={() => handleInnerModalOpen(i)}
					>
						Remover imagens
					</button>
				</div>
			);
		else return <div></div>;
	};

	const modal = (i: number) => {
		return (
			<div>
				<div className={`modal ${activeOuter[i]}`}>
					<div
						id={`modalBackgroundSlider${i}`}
						className="modal-background"
						onClick={() => {
							handleOuterModalClose();
						}}
					/>
					<div id={`modalCardSlider${i}`} className="modal-card">
						<header
							className="modal-card-head"
							style={{ backgroundColor: "#e6fcfc" }}
						>
							<p
								className="modal-card-title"
								style={{
									whiteSpace: "pre-line",
								}}
							>
								{props.Cursos[i].Titulo}
							</p>
							<button
								onClick={() => {
									handleOuterModalClose();
								}}
								className="delete"
								aria-label="close"
							/>
						</header>
						<header style={{ backgroundColor: "#f7f7f7" }}>
							<p className="modal-card-title my-2">
								Instrutor: {props.Cursos[i].Instrutor}
							</p>
						</header>
						<section className="modal-card-body">
							<div className="buttons is-centered">
								<News URL={props.Cursos[i].Noticia} />
							</div>
							<div>{props.Cursos[i].Imagens}</div>

							{/*put this part inside if_logged_in() */}
							<UploadImagesButton
								setFileList={setFileList}
								setHasFilesUploaded={setHasFilesUploaded}
								hasFilesUploaded={hasFilesUploaded}
								title={props.Cursos[i].Titulo}
								folder={props.Cursos[i].Folder}
								fileList={fileList}
								navigate={navigate}
							/>

							{removeImagesButton(i)}

							<ParticipantsTable
								ParticipantList={
									props.Cursos[i].ListaParticipantes
								}
							/>
						</section>
						<footer
							className="modal-card-foot"
							style={{ backgroundColor: "#e6fcfc" }}
						></footer>
					</div>
				</div>
				{/*inner modal*/}
				<RemoveImagesModal
					handleInnerModalClose={handleInnerModalClose}
					setSelectedThumbs={setSelectedThumbs}
					activeInner={activeInner[i]}
					index={props.Cursos[i].Index}
					title={props.Cursos[i].Titulo}
					folder={props.Cursos[i].Folder}
					ImagensPath={props.Cursos[i].ImagensPath}
					selectedThumbs={selectedThumbs}
					navigate={navigate}
				/>
			</div>
		);
	};

	const sliderImg = (i: number) => {
		return (
			<div>
				<img
					style={{ cursor: "pointer" }}
					src={props.Cursos[i].Imagem0}
					alt=""
					onClick={() => {
						handleOuterModalOpen(i);
					}}
				></img>
			</div>
		);
	};

	return (
		<div className="Modal">
			{modal(0)}
			{modal(1)}
			{modal(2)}
			{modal(3)}
			{modal(4)}
			<Slider
				autoplay={true}
				dots={true}
				infinite={true}
				speed={500}
				slidesToShow={1}
				slidesToScroll={1}
			>
				{sliderImg(0)}
				{sliderImg(1)}
				{sliderImg(2)}
				{sliderImg(3)}
				{sliderImg(4)}
			</Slider>
		</div>
	);
}
