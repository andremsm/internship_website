import { useState, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Curso, CursoFromJson, Participante } from "./Interface";
import { SimpleSlider } from "./SimpleSlider";
import { Modal } from "./Modal";
import { LoginModal } from "./LoginModal";
import { LogoutButton } from "./LogoutButton";
import { UpdatePasswordModal } from "./UpdatePasswordModal";
import {
	importAll,
	widthIfMobile,
	heightIfMobile,
	authExpiration,
} from "./Utils";
import { ReactComponent as Triskele } from "./glyphs/triskele.svg";
import "bulma/css/bulma.css";
import "bulma/css/bulma.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./App.css";

function App() {
	// All Courses
	const [courseTable, setCourseTable] = useState<Array<React.ReactElement>>(
		[]
	);
	// Last 5 courses
	const [recentCourses, setRecentCourses] = useState<Array<Curso>>([]);
	// Variable to avoid crashes (more info at the end of the useEffect)
	const [loading, setLoading] = useState(true);

	const [loggedIn, setLoggedIn] = useState(true);

	useEffect(() => {
		// GET request using fetch inside useEffect React hook

		const access_token = authExpiration()!;

		fetch("http://localhost:8080/api/test/admin", {
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				"x-access-token": access_token,
				//"Access-Control-Allow-Origin": "http://10.56.14.26:3000",
			},
			cache: "no-store",
		})
			.then((response) => {
				return response.json();
			})
			.then((jsonFile) => {
				// LazyLoadImage does not accept images as string paths
				// (./img/curso/Curso Exemplo/img.jpg), as placeholders
				const context = require.context(
					"../public/img/curso_compressed",
					true, // Search recursively
					/\.(png|jpe?g|svg)$/
				);
				// Turn context into something that LazyLoadImage will accept
				const placeholders = importAll(context);

				// Modal list
				const updatedCourseTable: Array<React.ReactElement> = [];
				// Course data list
				const coursesData: Array<Curso> = [];

				let placeholder_index = 0;
				let i = 0;
				let k = -1;
				// Iterate through each course
				jsonFile.forEach((item: CursoFromJson, jsonIndex: number) => {
					// Get participant list, if logged in
					const participantList = item.Participantes
						? item.Participantes.map(
								(p: Participante, index: number) => {
									return (
										<tr
											key={
												"p" +
												jsonIndex.toString() +
												index.toString()
											}
										>
											<td>{p.Nome}</td>
											<td>{p.Unidade}</td>
										</tr>
									);
								}
						  )
						: [];

					let img0 = "";
					// Get image list, if this course has images
					const imageList = item.Imagens
						? item.Imagens.map((img: string, index: number) => {
								const imgSrc =
									"/img/curso/" +
									i.toString() +
									" - " +
									item.Curso +
									"/" +
									img;
								if (index === 0) img0 = imgSrc;
								const placeholder: string = placeholders[
									placeholder_index
								] as string;
								placeholder_index++;
								return (
									<LazyLoadImage
										key={index.toString() + img}
										src={imgSrc}
										placeholderSrc={placeholder}
										width={widthIfMobile()}
										height={heightIfMobile()}
										effect="blur"
										alt=""
										loading="lazy"
									></LazyLoadImage>
								);
						  })
						: [];

					if (!img0) {
						img0 = "/img/no_image.png";
					}

					coursesData.push({
						Titulo: item.Curso,
						Data: item.Data,
						Semestre: item.Semestre,
						Instrutor: item.Instrutor,
						Participantes: item.NumeroParticipantes,
						ListaParticipantes: participantList,
						ListaParticipantesDados: item.Participantes,
						Imagens: imageList,
						ImagensPath: item.Imagens,
						Noticia: item.Noticia,
						Cor: "azure",
						Index: i,
						Imagem0: img0,
						Folder: `${item.Index} - ${item.Curso}`,
					});
					if (i % 2 === 0) coursesData[i].Cor = "#f7ffff";

					// Simple separation between semesters
					if (k !== -1)
						if (item.Semestre !== coursesData[k].Semestre)
							updatedCourseTable.push(
								<div key={coursesData[k].Semestre}>
									<div>&nbsp;</div>
									<div>
										<strong>
											{"Semestre: " +
												coursesData[k].Semestre}
										</strong>
									</div>
								</div>
							);

					// Append new modal to the list, using the information
					// gathered for this course
					updatedCourseTable.push(
						<Modal
							Curso={coursesData[i]}
							key={"modal" + jsonIndex.toString()}
						></Modal>
					);
					i++;
					k++;
				});
				// Append one last separator
				updatedCourseTable.push(
					<div key={coursesData[coursesData.length - 1].Semestre}>
						<strong>
							{"Semestre: " +
								coursesData[coursesData.length - 1].Semestre}
						</strong>
					</div>
				);
				// Create another list containing the last five courses
				// (this will be used in the image scroller)
				i--;
				const j = i - 5;
				const tempLastCourses: Array<Curso> = [];
				for (i; i > j; i--) {
					tempLastCourses.push(coursesData[i]);
				}
				setRecentCourses(tempLastCourses);
				// Courses will be sorted from the oldest to the newest,
				// need to reverse the list
				setCourseTable(updatedCourseTable.reverse());
				// While this useEffect has not finished running, React will
				// try to render the image scroller using an empty array,
				// which will cause the webpage to crash. This variable
				// prevents that by making it display a loading text instead
				if (access_token === undefined) setLoggedIn(false);
				setLoading(false);
			});

		// empty dependency array means this effect will only run once (like componentDidMount in classes)
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const simple_slider = <SimpleSlider Cursos={recentCourses}></SimpleSlider>;
	return (
		<div className="App">
			{/*header*/}
			<div className="block">
				<section className="section">
					<div className="container">
						<a href="https://www.pmpr.pr.gov.br/">
							<img
								className="pmpr"
								src="/img/pmpr.png"
								alt="Clique aqui para ir à página da PMPR"
								title="Clique aqui para ir à página da PMPR"
							/>
						</a>
					</div>
					<div className="container">
						<a href="https://intranet.mppr.mp.br/Pagina/Coordenadoria-de-Seguranca-Institucional">
							<img
								className="cosi"
								src="/img/topo.png"
								alt="Clique aqui para ir à página da COSI"
								title="Clique aqui para ir à página da COSI"
							/>
						</a>
					</div>

					<div className="container">
						<h1 className="title header">Cursos e instruções</h1>
					</div>
				</section>
				<section className="separator">
					{loggedIn ? (
						loading ? (
							<div>&nbsp;</div>
						) : (
							<div>
								<UpdatePasswordModal></UpdatePasswordModal>
								<LogoutButton></LogoutButton>
							</div>
						)
					) : (
						<LoginModal></LoginModal>
					)}
				</section>
			</div>
			{/*Image scroller with the last five courses*/}
			<div className="block">
				<div className="card is-shadowless">
					<div className="card-image sliderBackground">
						<div
							className="slider"
							onClick={() => setLoading(false)}
						>
							{
								/*See line 194.*/
								loading
									? "carregando... caso demore demais, clique"
									: simple_slider
							}
						</div>
					</div>
				</div>
			</div>

			{courseTable}

			<div className="triskele">
				<Triskele />
			</div>
			<section className="separatorFooter">
				<div>&nbsp;</div>
			</section>
		</div>
	);
}

export default App;
