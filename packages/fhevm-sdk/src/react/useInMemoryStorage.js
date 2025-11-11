"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryStorageProvider = exports.useInMemoryStorage = void 0;
const react_1 = require("react");
const GenericStringStorage_1 = require("../storage/GenericStringStorage");
const InMemoryStorageContext = (0, react_1.createContext)(undefined);
const useInMemoryStorage = () => {
    const context = (0, react_1.useContext)(InMemoryStorageContext);
    if (!context) {
        throw new Error("useInMemoryStorage must be used within a InMemoryStorageProvider");
    }
    return context;
};
exports.useInMemoryStorage = useInMemoryStorage;
const InMemoryStorageProvider = ({ children }) => {
    const [storage] = (0, react_1.useState)(new GenericStringStorage_1.GenericStringInMemoryStorage());
    return <InMemoryStorageContext.Provider value={{ storage }}>{children}</InMemoryStorageContext.Provider>;
};
exports.InMemoryStorageProvider = InMemoryStorageProvider;
