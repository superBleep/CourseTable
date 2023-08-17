import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "./components/Login";
import Logged from "./components/Logged";
import CheckLogin from './components/CheckLogin';

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="*" element={
					<CheckLogin>
						<Logged />
					</CheckLogin>
				} />
				<Route path='login' element={<Login />} />
			</Routes>
		</BrowserRouter>
	);
}
