# Mac iOS Build

This repository is prepared for building the iOS app on a Mac with Xcode.

## Clone

Replace `<OWNER>` with the GitHub account or organization that owns the private repository.

```sh
git clone https://github.com/<OWNER>/animal-picture-book.git
cd animal-picture-book
```

## Prepare the App

```sh
npm install
npm run build
npm run ios:sync
open ios/App/App.xcodeproj
```

## Xcode

1. Open `ios/App/App.xcodeproj`.
2. Select the `App` target.
3. In `Signing & Capabilities`, choose the development team and set the bundle identifier if needed.
4. Select a connected iPhone as the run destination.
5. Run the app on the iPhone.

## Offline Device Check

With the iPhone in Airplane Mode, check:

- animal list
- animal detail pages
- animal images
- favorites
- search
