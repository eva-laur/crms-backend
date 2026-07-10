import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { f as useRole } from "./role-context-YJO8G-xL.mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as FileText, F as Lock, g as ShieldCheck, nt as Download, q as GraduationCap } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as CardHeader, i as CardContent, n as Badge, o as CardTitle, r as Card, t as AppHeader } from "./card-eBpIeksT.mjs";
import { t as Button } from "./button-PJVP9td7.mjs";
import { t as Progress } from "./progress-DOIEKRJF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.results-DbH3KmJE.js
var import_jsx_runtime = require_jsx_runtime();
var SUBJECTS = [
	{
		code: "CS-401",
		name: "Distributed Systems",
		credits: 4,
		ca: {
			attendance: 9,
			tests: 24,
			lab: 13
		},
		exam: 41
	},
	{
		code: "CS-220",
		name: "Computer Networks",
		credits: 3,
		ca: {
			attendance: 8,
			tests: 22,
			lab: 14
		},
		exam: 38
	},
	{
		code: "MA-310",
		name: "Linear Algebra",
		credits: 3,
		ca: {
			attendance: 9,
			tests: 20,
			lab: 0
		},
		exam: 36
	},
	{
		code: "EE-150",
		name: "Signals & Systems",
		credits: 3,
		ca: {
			attendance: 7,
			tests: 18,
			lab: 11
		},
		exam: 30
	},
	{
		code: "PH-202",
		name: "Engineering Physics",
		credits: 2,
		ca: {
			attendance: 8,
			tests: 19,
			lab: 10
		},
		exam: 33
	}
];
function grade(total) {
	if (total >= 80) return {
		letter: "A",
		gpa: 4,
		status: "Passed",
		tone: "success"
	};
	if (total >= 70) return {
		letter: "B",
		gpa: 3.3,
		status: "Passed",
		tone: "success"
	};
	if (total >= 60) return {
		letter: "C",
		gpa: 2.7,
		status: "Passed",
		tone: "success"
	};
	if (total >= 50) return {
		letter: "D",
		gpa: 2,
		status: "Passed",
		tone: "warning"
	};
	if (total >= 45) return {
		letter: "E",
		gpa: 1.5,
		status: "Pending",
		tone: "warning"
	};
	return {
		letter: "F",
		gpa: 0,
		status: "Failed",
		tone: "destructive"
	};
}
function ResultsPage() {
	const { user, can } = useRole();
	if (!can("nav:results")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app/dashboard" });
	if (!user) return null;
	const rows = SUBJECTS.map((s) => {
		const caTotal = s.ca.attendance + s.ca.tests + s.ca.lab;
		const total = caTotal + s.exam;
		const g = grade(total);
		return {
			...s,
			caTotal,
			total,
			g
		};
	});
	const totalCredits = rows.reduce((a, r) => a + r.credits, 0);
	const weightedGPA = rows.reduce((a, r) => a + r.g.gpa * r.credits, 0) / totalCredits;
	const cumulative = rows.reduce((a, r) => a + r.total, 0) / rows.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "Academic Results Portal",
		subtitle: "Off-campus access to your official semester record"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-8 py-6 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-card/60 border-primary/30",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between gap-3 pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-10 w-10 rounded-lg bg-primary/15 ring-1 ring-primary/40 flex items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5 text-primary" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Official Academic Performance Portal"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] text-muted-foreground",
							children: [
								"Encrypted session · ",
								user.matricule,
								" · Spring Semester 2026"
							]
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "border-success/40 text-success text-[10px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3 w-3 mr-1" }), " SECURE CHANNEL"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => toast.success("Transcript PDF queued", { description: `Sent to ${user.email}` }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 mr-1.5" }), " Download Digital Transcript (PDF)"]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 lg:grid-cols-4 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Semester GPA",
								value: weightedGPA.toFixed(2),
								hint: "weighted by credits"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Average Total",
								value: `${cumulative.toFixed(1)}%`,
								hint: "across all subjects"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Credits Attempted",
								value: `${totalCredits}`,
								hint: `${rows.length} subjects`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Standing",
								value: "Good Standing",
								hint: "Top 18% of cohort",
								tone: "success"
							})
						]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-card/60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "text-base flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 text-primary" }), " 1 · Continuous Assessment (CA) Marks"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground",
					children: "Attendance · Tests · Lab Practical · weighted out of 50"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm min-w-[640px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground bg-background/40 border-y border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-5 py-2.5 font-medium",
									children: "Code"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-2.5 font-medium",
									children: "Subject"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right px-3 py-2.5 font-medium",
									children: "Attend. /10"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right px-3 py-2.5 font-medium",
									children: "Tests /25"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right px-3 py-2.5 font-medium",
									children: "Lab /15"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right px-5 py-2.5 font-medium",
									children: "CA Total /50"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 font-mono text-xs text-primary",
									children: r.code
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: r.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 text-right tabular-nums",
									children: r.ca.attendance
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 text-right tabular-nums",
									children: r.ca.tests
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 text-right tabular-nums",
									children: r.ca.lab || "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 text-right font-semibold tabular-nums",
									children: r.caTotal
								})
							]
						}, r.code)) })]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-card/60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "text-base flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-4 w-4 text-primary" }), " 2 · Final Semester Exam Marks"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground",
					children: "Centrally invigilated · weighted out of 50"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm min-w-[520px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground bg-background/40 border-y border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-5 py-2.5 font-medium",
									children: "Subject"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right px-3 py-2.5 font-medium",
									children: "Exam /50"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-5 py-2.5 font-medium w-[40%]",
									children: "Performance"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-5 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-xs text-primary mr-2",
										children: r.code
									}), r.name]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 text-right font-semibold tabular-nums",
									children: r.exam
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
										value: r.exam / 50 * 100,
										className: "h-1.5"
									})
								})
							]
						}, r.code)) })]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-card/60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "text-base flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-4 w-4 text-primary" }), " 3 · Computed Subject Totals & Final Grade"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground",
					children: "CA + Exam · letter grade · GPA contribution · status"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm min-w-[760px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "text-[11px] uppercase tracking-wider text-muted-foreground bg-background/40 border-y border-border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left  px-5 py-2.5 font-medium",
										children: "Subject"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-right px-3 py-2.5 font-medium",
										children: "Credits"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-right px-3 py-2.5 font-medium",
										children: "CA"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-right px-3 py-2.5 font-medium",
										children: "Exam"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-right px-3 py-2.5 font-medium",
										children: "Total /100"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-center px-3 py-2.5 font-medium",
										children: "Grade"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-right px-3 py-2.5 font-medium",
										children: "GPA"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-right px-5 py-2.5 font-medium",
										children: "Status"
									})
								] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border/60",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-5 py-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-xs text-primary mr-2",
											children: r.code
										}), r.name]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 text-right tabular-nums",
										children: r.credits
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 text-right tabular-nums",
										children: r.caTotal
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 text-right tabular-nums",
										children: r.exam
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 text-right font-semibold tabular-nums",
										children: r.total
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 text-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary text-xs font-semibold ring-1 ring-primary/30",
											children: r.g.letter
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 text-right tabular-nums",
										children: r.g.gpa.toFixed(1)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-5 py-3 text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: r.g.tone === "success" ? "border-success/40 text-success" : r.g.tone === "warning" ? "border-warning/40 text-warning" : "border-destructive/40 text-destructive",
											children: r.g.status
										})
									})
								]
							}, r.code)) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "bg-background/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground",
										colSpan: 4,
										children: "Weighted semester GPA"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 text-right font-semibold tabular-nums",
										children: cumulative.toFixed(1)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 text-right font-semibold text-primary tabular-nums",
										children: weightedGPA.toFixed(2)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-5 py-3 text-right text-[11px] text-muted-foreground",
										children: "/ 4.0"
									})
								]
							}) })
						]
					})
				})]
			})
		]
	})] });
}
function Stat({ label, value, hint, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-background/40 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-wider text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `mt-1 text-xl font-semibold tabular-nums ${tone === "success" ? "text-success" : ""}`,
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-muted-foreground mt-0.5",
				children: hint
			})
		]
	});
}
//#endregion
export { ResultsPage as component };
