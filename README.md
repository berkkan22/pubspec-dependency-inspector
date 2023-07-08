# Pubspec dependency inspector

![Status](https://img.shields.io/github/deployments/sch-28/ikusa/production?label=Deployment)
![Latest commit](https://img.shields.io/github/last-commit/berkkan22/pubspec-dependency-inspector)

**Pubspec dependency inspector** is a VS Code extension for managing and updating dependencies in the Flutter framework. It provides a convenient way to check for newer versions of dependencies listed in the `pubspec.yaml` file and offers quick fixes to update them.

## Features

- Dependency Update: View a list of outdated dependencies in the `pubspec.yaml` file and easily update them to their latest versions using the command `Analyzes dependencies`.
- Quick Fix: Receive code actions (quick fixes) for each outdated dependency, allowing you to update them with a single click to the latest version.
- Update all dependencies: Update all outdated dependencies at once using the command `Update all dependencies`.
- Version Comparison: Compare the current version in the `pubspec.yaml` file with the latest version available on pub.dev to determine if an update is needed.

## Installation

1. Launch Visual Studio Code.
2. Go to the Extensions view by clicking on the square icon in the left sidebar or by pressing `Ctrl+Shift+X`.
3. Search for "Pubspec dependency inspector" in the Marketplace search bar.
4. Click on the "Install" button for the Extension Name extension.
5. Once installed, the extension will be activated automatically.

## Usage

1. Open a Flutter project in Visual Studio Code.
2. Open the `pubspec.yaml` file.
3. The extension will automatically analyze the file and detect outdated dependencies. If not you can use the command `Analyzes dependencies`.
4. Diagnostics will be displayed in the Problems view, indicating which dependencies require updates.
5. Click on a diagnostic to see the available quick fixes.
6. Choose the desired quick fix to update the dependency in the `pubspec.yaml` file.
7. Save the file to apply the changes.


https://github.com/berkkan22/pubspec-dependency-inspector/assets/46936985/ee88c55e-40b2-476c-9d8d-a0b7a34c5316



## Feedback and Support

If you encounter any issues or have suggestions for improvement, please feel free to raise an issue in the [GitHub repository](https://github.com/berkkan22/pubspec-dependency-inspector) or reach out to our support team at berkkan22@gmail.com.

## Future Plans and Ideas
As I continue to improve and enhance the functionality of Pubspec dependency inspector, I have several exciting ideas and plans in mind. Here are some of the features I want considering for future updates:

1. Dependency Information on Hover
2. Integrated Browser View for Dependency Info
3. Extension Search and Pubspec Integration

## Contribution

Contributions are welcome! If you have any ideas, improvements, or bug fixes, please submit a pull request to the [GitHub repository](https://github.com/berkkan22/pubspec-dependency-inspector).

## License

This extension is licensed under the [MIT License](LICENSE).

---

**Enjoy!** I hope this extension enhances your Flutter development experience. If you find it useful, please consider leaving a rating and review in the Visual Studio Code Marketplace.
Thank you for your support and happy coding!
