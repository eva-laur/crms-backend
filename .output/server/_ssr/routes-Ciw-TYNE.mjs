import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { f as useRole } from "./role-context-YJO8G-xL.mjs";
import { _ as Navigate, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as Mail, Ot as ArrowRight, U as KeyRound, W as IdCard, g as ShieldCheck, i as User, lt as CircleCheck } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Button } from "./button-PJVP9td7.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Ciw-TYNE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var iuc_campus_default = "/assets/iuc-campus-DTINZ3Bs.jpg";
var ROLE_HOME = {
	student: "/app/dashboard",
	faculty: "/app/dashboard",
	library_manager: "/app/library",
	logistics_manager: "/app/bus",
	it_manager: "/app/it-equipment",
	lab_manager: "/app/schedule",
	admin: "/app/dashboard"
};
function LoginPage() {
	const { user, loginWithCredentials, register } = useRole();
	const navigate = useNavigate();
	const [loginMatricule, setLoginMatricule] = (0, import_react.useState)("");
	const [loginPassword, setLoginPassword] = (0, import_react.useState)("");
	const [regName, setRegName] = (0, import_react.useState)("");
	const [regEmail, setRegEmail] = (0, import_react.useState)("");
	const [regMatricule, setRegMatricule] = (0, import_react.useState)("");
	const [regPassword, setRegPassword] = (0, import_react.useState)("");
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: ROLE_HOME[user.role] });
	const onLogin = async (e) => {
		e.preventDefault();
		if (!loginMatricule.trim()) return toast.error("Matricule is required");
		const res = await loginWithCredentials(loginMatricule, loginPassword);
		if (!res.ok) return toast.error(res.error);
		toast.success("Welcome back");
		navigate({ to: ROLE_HOME[res.role] });
	};
	const onRegister = async (e) => {
		e.preventDefault();
		if (!regMatricule.trim()) return toast.error("Matricule is required");
		const res = await register({
			name: regName,
			email: regEmail,
			password: regPassword,
			matricule: regMatricule
		});
		if (!res.ok) return toast.error(res.error);
		toast.success("Student account created — welcome!");
		navigate({ to: "/app/dashboard" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 bg-cover bg-center bg-no-repeat",
				style: {
					backgroundImage: `url(${iuc_campus_default})`,
					filter: "blur(8px)",
					transform: "scale(1.05)"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-black/40 dark:bg-black/55" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 w-full max-w-5xl grid md:grid-cols-[1.05fr_1fr] gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden md:flex flex-col justify-between rounded-3xl p-10 bg-white/10 dark:bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-[var(--shadow-elevated)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-10 w-10 rounded-xl bg-white/20 ring-1 ring-white/40 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5 text-white" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-[0.2em] text-white/70",
								children: "IUC / SEAS"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-lg font-semibold",
								children: "Campus Resource Management"
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "mt-12 text-4xl font-semibold leading-tight tracking-tight",
							children: ["One operating system for ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-accent",
								children: "every campus resource."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-white/80 max-w-md",
							children: "Register as a student to get started. Faculty and resource-manager roles are assigned by the Administrator after registration."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-3 text-sm",
						children: [
							"Sign in with your matricule and password",
							"Live conflict detection on every booking",
							"Role-aware interface — zero feature leakage"
						].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2 text-white/80",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-success" }),
								" ",
								t
							]
						}, t))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-3xl p-6 md:p-8 bg-white/10 dark:bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-[var(--shadow-elevated)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						defaultValue: "login",
						className: "w-full",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "grid w-full grid-cols-2 bg-white/10 dark:bg-white/10 backdrop-blur-md border border-white/20 p-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "login",
									className: "text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white",
									children: "Sign in"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "register",
									className: "text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white",
									children: "Create student account"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
								value: "login",
								className: "pt-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-xl font-semibold tracking-tight text-white",
										children: "Welcome back"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-white/70 mt-0.5",
										children: "Enter your matricule (student number / staff ID) and password."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
										className: "mt-6 space-y-4",
										onSubmit: onLogin,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Matricule",
												icon: IdCard,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "e.g. IUC-2024-STU-0421",
													value: loginMatricule,
													onChange: (e) => setLoginMatricule(e.target.value),
													className: "pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Password",
												icon: KeyRound,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "password",
													placeholder: "••••••••",
													value: loginPassword,
													onChange: (e) => setLoginPassword(e.target.value),
													className: "pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "submit",
												className: "w-full h-11",
												children: ["Sign in ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4 ml-1" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[11px] text-white/70 text-center",
												children: [
													"Sign in with the matricule/password of a user created via registration or the ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono text-white",
														children: "seed:demo"
													}),
													" script."
												]
											})
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
								value: "register",
								className: "pt-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-xl font-semibold tracking-tight text-white",
										children: "Create your student account"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-white/70 mt-0.5",
										children: [
											"All new accounts start as ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium text-white",
												children: "Student"
											}),
											". The Administrator promotes faculty and resource managers from the User Management console."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
										className: "mt-5 space-y-4",
										onSubmit: onRegister,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Full name",
												icon: User,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: regName,
													onChange: (e) => setRegName(e.target.value),
													placeholder: "Jane Doe",
													className: "pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Email",
													icon: Mail,
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "email",
														value: regEmail,
														onChange: (e) => setRegEmail(e.target.value),
														placeholder: "you@iuc.edu",
														className: "pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50"
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Matricule *",
													icon: IdCard,
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: regMatricule,
														onChange: (e) => setRegMatricule(e.target.value),
														placeholder: "IUC-2026-STU-xxxx",
														required: true,
														className: "pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50"
													})
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Password",
												icon: KeyRound,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "password",
													value: regPassword,
													onChange: (e) => setRegPassword(e.target.value),
													placeholder: "min. 6 characters",
													className: "pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "submit",
												className: "w-full h-11",
												children: ["Create account ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4 ml-1" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[11px] text-white/70 text-center",
												children: "By registering you agree to the campus IT acceptable-use policy."
											})
										]
									})
								]
							})
						]
					})
				})]
			})
		]
	});
}
function Field({ label, icon: Icon, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-white/90",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" }), children]
		})]
	});
}
//#endregion
export { LoginPage as component };
