import * as vscode from "vscode";
import { Dependency } from "./dependency";

export interface CustomDiagnostic {
    diagnostic: vscode.Diagnostic;
    dependency: Dependency;
}