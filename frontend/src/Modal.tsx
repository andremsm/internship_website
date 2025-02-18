import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
//import { useNavigate } from "react-router-dom";
import { TweenMax, Power4 } from "gsap";
import { CursoProps } from "./Interface";
import { isLongString, sizeBoxesMobile } from "./Utils";
import "./LoginModal.css";
import "./glyphs/style.css";
import { browserName } from "react-device-detect";
import { RemoveImagesButton } from "./RemoveImagesButton";
import { UploadImagesButton } from "./UploadImagesButton";
import { RemoveImagesModal } from "./RemoveImagesModal";
import { ParticipantsTable } from "./ParticipantsTable";
import { News } from "./News";

export function Modal(props: CursoProps) {
	//Para mais informações, ver como o as classes funcionam no site do Bulma,
	//principalmente a classe "Modal".

	const [isOuterModal, setOuterModal] = useState(false);
	const [isInnerModal, setInnerModal] = useState(false);
	const [fileList, setFileList] = useState<FileList | null>(null);
	const [hasFilesUploaded, setHasFilesUploaded] = useState(false);
	//const [innerModalActive, setInnerModalActive] = useState(false);

	const [selectedThumbs, setSelectedThumbs] = useState<Array<string>>([]);

	const [queryParams] = useSearchParams();
	const navigate = useNavigate();

	//Ao clicar no box, definir o modal como ativo.
	const handleOuterModalOpen = () => {
		window.history.pushState(
			"fake-route",
			document.title,
			`?course=${props.Curso.Titulo}`
		);
		setOuterModal(true);
		//console.log("outer modal open");
	};

	const handleInnerModalOpen = () => {
		window.history.pushState(
			"fake-route",
			document.title,
			`?course=${props.Curso.Titulo}`
		);
		setInnerModal(true);
		//console.log("inner modal open");
		//console.log(isInnerModal);
	};

	//Ao clicar no 'x', ou fora do modal definir o modal como inativo.
	const handleOuterModalClose = () => {
		//console.log(window.history);
		window.history.back();

		//console.log("outer modal close");
	};

	const handleInnerModalClose = () => {
		window.history.back();
		setSelectedThumbs([]);

		//console.log("inner modal close");
	};

	//Permite fechar o modal pressionando "Voltar" no navegador.
	useEffect(() => {
		//Mobile only.
		if (true) {
			const handleBack = () => {
				if (isInnerModal && isOuterModal) setInnerModal(false);
				else if (!isInnerModal && isOuterModal) setOuterModal(false);
			};

			// Add a fake history event so that the back button does nothing if pressed once

			window.addEventListener("popstate", handleBack);

			// Here is the cleanup when this component unmounts
			return () => {
				window.removeEventListener("popstate", handleBack);
				// If we left without using the back button, aka by using a button on the page, we need to clear out that fake history event
				if (window.history.state === "fake-route") {
					// this was previously working, but now it doesn't for
					// some reason
					// this might lead to some problems
					//window.history.back();
				}
			};
		} else return () => {};
	}, [isInnerModal, isOuterModal]);

	const activeOuter = isOuterModal ? "is-active" : "";
	const activeInner = isInnerModal ? "is-active" : "";

	//Permite fechar o modal apertando ESC.
	useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === "Escape" && (isInnerModal || isOuterModal)) {
				//console.log("esc_modal");
				window.history.back();
			}
		};
		window.addEventListener("keydown", handleEsc);

		return () => {
			window.removeEventListener("keydown", handleEsc);
		};
	}, [isInnerModal, isOuterModal]);

	useEffect(() => {
		const courseURL = queryParams.get("course");
		//console.log(courseURL);
		if (courseURL === props.Curso.Titulo) {
			//console.log(courseURL);
			navigate("/", { replace: true });
			window.history.pushState(
				"fake-route",
				document.title,
				`?course=${props.Curso.Titulo}`
			);
			//handleOuterModalOpen();
			setOuterModal(true);
		}
		// empty dependency array means this effect will only run once (like componentDidMount in classes)
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (isOuterModal) {
			const cardString = `#modalCard${props.Curso.Index}`;
			const backgroundString = `#modalBackground${props.Curso.Index}`;
			const modalCard = document.querySelector(cardString);
			const modalBackground = document.querySelector(backgroundString);
			const y = () => {
				if (browserName === "Chrome") return 0;
				else return 128;
			};
			//y: 128
			TweenMax.set(modalCard, { y: y, opacity: 0 });
			TweenMax.set(modalBackground, { opacity: 0 });
			TweenMax.fromTo(
				modalCard,
				0.65,
				//y: 128
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
	}, [isOuterModal, props.Curso.Index]);

	// files is not an array, but it's iterable, spread to get an array of files
	//const files = fileList ? [...fileList] : [];

	//const modal_padding = innerModalActive ? "0 33%" : "0";

	return (
		<div className="Modal">
			<div
				className={`modal ${activeOuter}`}
				id={`idModalMain${props.Curso.Index}`}
			>
				{/*O handleClick abaixo serve para permitir que o modal
				possa ser fechado ao clicar fora dele.*/}
				<div
					id={`modalBackground${props.Curso.Index}`}
					className="modal-background"
					onClick={handleOuterModalClose}
				/>
				<div
					id={`modalCard${props.Curso.Index}`}
					className="modal-card"
				>
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
							{props.Curso.Titulo}
						</p>
						<button
							onClick={handleOuterModalClose}
							className="delete"
							aria-label="close"
						/>
					</header>
					<header style={{ backgroundColor: "#f7f7f7" }}>
						<p className="modal-card-title my-2">
							Instrutor: {props.Curso.Instrutor}
						</p>
					</header>
					<section className="modal-card-body">
						<div className="buttons is-centered">
							<News URL={props.Curso.Noticia} />
						</div>

						<div>{props.Curso.Imagens}</div>

						{/*put this part inside if_logged_in() */}
						<UploadImagesButton
							setFileList={setFileList}
							setHasFilesUploaded={setHasFilesUploaded}
							hasFilesUploaded={hasFilesUploaded}
							title={props.Curso.Titulo}
							folder={props.Curso.Folder}
							fileList={fileList}
							navigate={navigate}
						/>

						{/*button to open inner modal*/}
						<RemoveImagesButton
							handleInnerModalOpen={handleInnerModalOpen}
							length={props.Curso.ImagensPath.length}
						/>

						<ParticipantsTable
							ParticipantList={props.Curso.ListaParticipantes}
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
				activeInner={activeInner}
				index={props.Curso.Index}
				title={props.Curso.Titulo}
				folder={props.Curso.Folder}
				ImagensPath={props.Curso.ImagensPath}
				selectedThumbs={selectedThumbs}
				navigate={navigate}
			/>

			<div className="block mx-6 mb-0">
				<div className="columns is-centered">
					<div className="column is-two-thirds">
						<div
							onClick={handleOuterModalOpen}
							className={
								"box" + sizeBoxesMobile() + "bhover clickable"
							}
							style={{
								backgroundColor: props.Curso.Cor,
							}}
						>
							<div className="rrow">
								<div className="ccolumn has-text-centered">
									<p
										className={
											isLongString(
												props.Curso.Titulo,
												"Nunito",
												0
											) + "stext"
										}
									>
										<strong>{props.Curso.Titulo}</strong>
									</p>
								</div>
								<div className="ccolumn has-text-centered">
									<p
										className={
											isLongString(
												props.Curso.Titulo,
												"Nunito",
												1
											) + "stext"
										}
									>
										{props.Curso.Participantes +
											" participantes"}
									</p>
								</div>
								<div className="ccolumn has-text-centered">
									<p
										className={
											isLongString(
												props.Curso.Titulo,
												"Nunito",
												2
											) + "stext"
										}
									>
										{props.Curso.Data}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
