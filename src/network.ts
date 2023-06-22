import axios, { AxiosResponse } from "axios";
import { Dependency } from "./analyze_dependencies";

export async function fetchDependency(
    dependencies: Dependency
): Promise<AxiosResponse<any, any> | null> {
    const packageName = dependencies.name;

    const url = `https://pub.dev/api/packages/${packageName}`;

    try {
        const response = await axios.get(url);

        return response;

    } catch (error) {
        console.error(
            `Failed to fetch package information for ${packageName}:`,
            error
        );
        return null;
    }
}
