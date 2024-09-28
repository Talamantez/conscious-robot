import { useState, useEffect, useRef } from "preact/hooks";
import Button from "./Button.tsx";
import Loader from "./Loader.tsx";
import { dbName, dbVersion, storeName } from "../util/dbInfo.ts";


const CDN_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1713715098941-48da2a137a25",
    description: "Blue flowers in a field"
  },
  {
    url: "https://images.unsplash.com/photo-1713528192050-751daab979be",
    description: "Forest waterfall"
  },
  {
    url: "https://images.unsplash.com/photo-1707305319641-e11c5ca18309",
    description: "Night sky with stars"
  },
  {
    url: "https://images.unsplash.com/photo-1672318044310-7d022e4eb3f3",
    description: "Sunset over a lake"
  }
];

const ImageUploader = ({ onImageSelected }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCdnImage, setSelectedCdnImage] = useState("");
  const imageGridRef = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => {
      if (imageGridRef.current && imageGridRef.current.contains(e.target)) {
        e.preventDefault();
        imageGridRef.current.scrollTop += e.deltaY;
      }
    };

    const imageGrid = imageGridRef.current;
    if (imageGrid) {
      imageGrid.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (imageGrid) {
        imageGrid.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  const handleImageUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);
    const file = e.target.files[0];

    if (file) {
      try {
        const base64String = await convertToBase64(file);
        onImageSelected(base64String);
      } catch (error) {
        console.error("Upload error:", error);
        setError("Failed to encode image. Please try again.");
      } finally {
        setUploading(false);
      }
    } else {
      setError("No file selected");
      setUploading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleCdnImageSelect = (url) => {
    setSelectedCdnImage(url);
    onImageSelected(url);
  };

  return (
    <div>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {uploading ? (
        <Loader />
      ) : (
        <div>
          <div className="mb-4">
            <div 
              ref={imageGridRef}
              className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto p-2"
            >
              {CDN_IMAGES.map((image, index) => (
                <div
                  key={index}
                  className={`cursor-pointer border-2 rounded p-2 ${
                    selectedCdnImage === image.url ? 'border-blue-500' : 'border-gray-200'
                  }`}
                  onClick={() => handleCdnImageSelect(image.url)}
                >
                  <img
                    src={image.url}
                    alt={image.description}
                    className="w-full h-32 object-cover mb-2"
                  />
                  <p className="text-sm text-gray-600">{image.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="uploadImage" className="block mb-2">...Or upload your own:</label>
            <input
              id="uploadImage"
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const NewChapterModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => {
      if (modalRef.current && modalRef.current.contains(e.target)) {
        const { scrollTop, scrollHeight, clientHeight } = modalRef.current;
        if (
          (scrollTop === 0 && e.deltaY < 0) ||
          (scrollTop + clientHeight === scrollHeight && e.deltaY > 0)
        ) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleImageSelected = (imageData) => {
    setImageUrl(imageData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (title === "" || description === "" || !imageUrl) {
      setError("Please fill in all fields and select or upload an image.");
      setIsSubmitting(false);
      return;
    }

    try {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      const transaction = db.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);

      const countRequest = objectStore.count();
      const count = await new Promise((resolve, reject) => {
        countRequest.onsuccess = () => resolve(countRequest.result);
        countRequest.onerror = () => reject(countRequest.error);
      });

      const newChapter = {
        index: count.toString(),
        title,
        description,
        sections: [],
        imageUrl,
        isIncluded: true,
      };

      await new Promise((resolve, reject) => {
        const addRequest = objectStore.add(newChapter);
        addRequest.onerror = (event) => {
          console.error("Error details:", event.target.error);
          reject(event.target.error);
        };
        addRequest.onsuccess = () => resolve();
      });

      onSave(newChapter);
      onClose();
    } catch (error) {
      console.error("Error adding chapter:", error);
      setError("Failed to add chapter. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div ref={modalRef} className="p-6 overflow-y-auto flex-grow">
          <h2 className="text-2xl font-bold mb-4">Add New Chapter</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block mb-2">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block mb-2">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
                rows="3"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="coverImage" className="block mb-2">Select Cover Image</label>
              <ImageUploader onImageSelected={handleImageSelected} />
              {imageUrl && (
                <div className="mt-2">
                  <img className="max-h-32 object-cover" src={imageUrl} alt="Selected" />
                </div>
              )}
            </div>
          </form>
        </div>
        <div className="p-4 border-t flex justify-end">
          <Button
            text="Cancel"
            onClick={onClose}
            styles="bg-gray-300 hover:bg-gray-400 text-black rounded px-4 py-2 mr-2"
            disabled={isSubmitting}
          />
          <Button
            text={isSubmitting ? "Saving..." : "Save"}
            onClick={handleSubmit}
            styles="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2"
            disabled={isSubmitting || !imageUrl}
          />
        </div>
      </div>
    </div>
  );
};

export default NewChapterModal;