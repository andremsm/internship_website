import { ModalUploadImgProps } from "./Interface";
import { authExpiration, getCurrentUser } from "./Utils";
//import { useNavigate } from "react-router-dom";

export function UploadImagesButton(props: ModalUploadImgProps) {
	//const navigate = useNavigate();

	const files = props.fileList ? [...props.fileList] : [];

	const sendImages = () => {
		//console.log("sending images...");
		if (!props.fileList) return;

		const access_token = authExpiration!() as string;

		const data = new FormData();
		data.append("title", props.title);
		data.append("folderName", props.folder);

		files.forEach((file, index) => {
			data.append(`file-${index}`, file, file.name);
		});

		//console.log(data);
		//console.log("fetching...");

		fetch("http://localhost:8080/api/img/upload", {
			method: "POST",
			headers: {
				"x-access-token": access_token,
			},
			body: data,
		})
			.then((res) => res.json())
			.then((data) => console.log(data))
			.catch((err) => console.log(err));
		window.history.back();
		props.navigate("/", { replace: true });
		window.location.reload();
	};

	function hasFiles() {
		if (props.hasFilesUploaded)
			return (
				<button
					name="imageUpload"
					className="button is-info is-outlined"
					style={{
						whiteSpace: "pre-line",
					}}
					onClick={sendImages}
				>
					Enviar imagens
				</button>
			);
		else return <div></div>;
	}

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		props.setFileList(e.target.files);
		//console.log(e.target.files);
		if (!e.target.files || e.target.files.length === 0) {
			props.setHasFilesUploaded(false);
			return;
		}
		if (e.target.files.length !== 0) props.setHasFilesUploaded(true);
		//else setHasFilesUploaded(false);
	};

	if (getCurrentUser())
		return (
			<div>
				<div>&nbsp;</div>
				<label htmlFor="upload-images">
					<b>Upload de imagens&nbsp;</b>
				</label>
				<input
					//name="imageUpload"
					type="file"
					accept="image/*"
					id="upload-images"
					multiple
					onChange={handleFileUpload}
				/>
				{hasFiles()}
				<div>&nbsp;</div>
			</div>
		);
	else return <div></div>;
}
