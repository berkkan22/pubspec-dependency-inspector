import axios, { AxiosResponse } from "axios";
import { DependencyFromPubDev, Dependency } from "./model/dependency";

export async function fetchDependency(dependencies: Dependency): Promise<DependencyFromPubDev | null> {
    const url = `https://pub.dev/api/packages/${dependencies.name}`;

    try {
        const response = await axios.get(url);
        if(response.status === 200) {
            return DependencyFromPubDev.fromJson(response.data);
        }
        else {
            console.error(
                `Failed to fetch package information for ${dependencies.name}:`,
                response.status
            );
            return null;
        }
    }
    catch (error) {
        console.error(
            `Failed to fetch package information for ${dependencies.name}:`,
            error
        );
        return null;
    }
}
