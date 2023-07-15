import axios, { AxiosResponse } from "axios";
import { DependencyFromPubDev, Dependency } from "./model/dependency";

export async function fetchDependency(dependencies: Dependency): Promise<DependencyFromPubDev | null> {
    const url = `https://pub.dev/api/packages/${dependencies.name}`;

    try {
        const response = await axios.get(url);
        return DependencyFromPubDev.fromJson(response.data);
    }
    catch (error) {
        console.error(
            `Failed to fetch package information for ${dependencies.name}:`,
            error
        );
        return null;
    }
}
