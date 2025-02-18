import { logout, isNotMobile } from "./Utils";
import "./LoginModal.css";
import "./glyphs/style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icon } from "@fortawesome/fontawesome-svg-core/import.macro";

export function LogoutButton() {
	const logout_png = isNotMobile() ? (
		<figure className="image logout">
			<img alt="" src="/img/logout.png"></img>
		</figure>
	) : (
		<div></div>
	);

	return (
		<div className="buttons is-right px-6">
			{logout_png}
			<button
				className="button is-info has-icons-right"
				style={{
					whiteSpace: "pre-line",
				}}
				onClick={logout}
			>
				Logout&nbsp;&nbsp;&nbsp;
				<span className="icon is-small is-right">
					<FontAwesomeIcon
						icon={icon({
							name: "right-from-bracket",
							style: "solid",
						})}
					/>
				</span>
			</button>
		</div>
	);
}
