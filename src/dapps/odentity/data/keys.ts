export const keys = [
    {
        data: {
            image: "/icons/paperWallet.svg",
            title: "Circles SafeOwner",
            subtitle: "PrivateKey",
            privatekey: localStorage.getItem("omo.privateKey"),
        },
    },
];

export const labelKeys = {
    data: {
        label: "Keys secretly stored in your localstorage",
    },
};