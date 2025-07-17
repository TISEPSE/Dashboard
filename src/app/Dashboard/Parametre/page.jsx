//=========Page qui va gérer tout les paramètres=========//
import { Button } from 'rsuite';
import 'rsuite/dist/rsuite-no-reset.min.css';

export default function Paramètre() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold">Paramètre</h1>
            <p className="mt-4 text-lg">Bienvenue sur la page des paramètres !</p>
            <div className="flex flex-row gap-4">
                <Button appearance="default">Default</Button>
                <Button appearance="primary">Primary</Button>
                <Button appearance="link">Link</Button>
                <Button appearance="subtle">Subtle</Button>
                <Button appearance="ghost">Ghost</Button>
            </div>
        </div>
    )
}