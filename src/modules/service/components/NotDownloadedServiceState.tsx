import DownloadIcon from "shared/components/DownloadIcon";
import Spinner from "shared/components/Spinner";
import { ServiceStateProps } from "../types";
import useDownloadServiceStream from "shared/hooks/useDownloadServiceStream";

const NotDownloadedServiceState = ({ serviceId, refetch }: ServiceStateProps) => {
  const { progress, download } = useDownloadServiceStream();

  const onDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    download(serviceId, refetch);
  };

  if (progress >= 0) {
    return (
      <>
        <p className="text-brightgray">{progress}%</p>
        <Spinner className="w-5 h-5" />
      </>
    );
  }

  return (
    <button onClick={onDownload}>
      <DownloadIcon />
    </button>
  );
};

export default NotDownloadedServiceState;
